import { FastifyReply, FastifyRequest } from "fastify";
import { Op, Transaction } from "sequelize";
import { isEmail } from "validator";

import type {
  AdminSignupUpdateBody,
  SignupID,
  SignupPathParams,
  SignupUpdateBody,
  SignupUpdateResponse,
  SignupValidationErrors,
} from "@tietokilta/ilmomasiina-models";
import { AuditEvent, SignupFieldError } from "@tietokilta/ilmomasiina-models";
import sendSignupConfirmationMail from "../../mail/signupConfirmation";
import { getSequelize } from "../../models";
import { Answer, AnswerCreationAttributes } from "../../models/answer";
import { Event } from "../../models/event";
import { Question } from "../../models/question";
import { Signup } from "../../models/signup";
import { signupEditable } from "./createNewSignup";
import { NoSuchSignup, SignupsClosed, SignupValidationError } from "./errors";

async function getSignupAndEventForUpdate(id: SignupID, transaction: Transaction) {
  // Retrieve event data and lock the row for editing
  const signup = await Signup.scope("active").findByPk(id, {
    transaction,
    lock: Transaction.LOCK.UPDATE,
  });
  if (signup === null) {
    throw new NoSuchSignup("Signup expired or already deleted");
  }

  const quota = await signup.getQuota({
    include: [
      {
        model: Event,
        include: [
          {
            model: Question,
          },
        ],
      },
    ],
    transaction,
  });
  const event = quota.event!;

  return { signup, event };
}

/** Internal implementation. Performs no validation for admin editing purposes. */
async function updateSignup(
  signup: Signup,
  fields: Partial<Signup>,
  answers: AnswerCreationAttributes[],
  transaction: Transaction,
) {
  // Update fields for the signup
  await signup.update(
    {
      ...fields,
      confirmedAt: new Date(),
    },
    { transaction },
  );

  // Update the Answers for the Signup
  await Answer.destroy({
    where: {
      signupId: signup.id,
      questionId: {
        [Op.notIn]: answers.map((answer) => answer.questionId),
      },
    },
    transaction,
  });
  await Answer.bulkCreate(answers, { transaction });

  return signup;
}

/** Requires editTokenVerification */
export async function updateSignupAsUser(
  request: FastifyRequest<{ Params: SignupPathParams; Body: SignupUpdateBody }>,
  reply: FastifyReply,
): Promise<SignupUpdateResponse> {
  const { updatedSignup, edited } = await getSequelize().transaction(async (transaction) => {
    const { signup, event } = await getSignupAndEventForUpdate(request.params.id, transaction);

    if (!signupEditable(event, signup)) {
      throw new SignupsClosed("Signups closed for this event.");
    }

    /** Is this signup already confirmed (i.e. is this the first update for this signup) */
    const notConfirmedYet = !signup.confirmedAt;
    const questions = event.questions!;

    // Collect fields to update on signup itself (name and email only editable on first confirmation)
    const fields: Partial<Signup> = {};
    const errors: SignupValidationErrors = {};

    // Check that required common fields are present (if first time confirming)
    if (notConfirmedYet && event.nameQuestion) {
      const { firstName, lastName } = request.body;
      if (!firstName) {
        errors.firstName = SignupFieldError.MISSING;
      } else if (firstName.length > Signup.MAX_NAME_LENGTH) {
        errors.firstName = SignupFieldError.TOO_LONG;
      }
      if (!lastName) {
        errors.lastName = SignupFieldError.MISSING;
      } else if (lastName.length > Signup.MAX_NAME_LENGTH) {
        errors.lastName = SignupFieldError.TOO_LONG;
      }
      fields.firstName = firstName;
      fields.lastName = lastName;
    }

    if (notConfirmedYet && event.emailQuestion) {
      const { email } = request.body;
      if (!email) {
        errors.email = SignupFieldError.MISSING;
      } else if (email.length > Signup.MAX_EMAIL_LENGTH) {
        errors.email = SignupFieldError.TOO_LONG;
      } else if (!isEmail(email)) {
        errors.email = SignupFieldError.INVALID_EMAIL;
      }
      fields.email = email;
    }

    // Update signup language and name publicity if provided
    if (request.body.namePublic != null) {
      fields.namePublic = request.body.namePublic;
    }
    if (request.body.language) {
      fields.language = request.body.language;
    }

    // Check that all questions are answered with a valid answer
    const newAnswers = questions.map((question) => {
      // Fetch the answer to this question from the request body
      let answer = request.body.answers?.find((a) => a.questionId === question.id)?.answer;
      let error: SignupFieldError | undefined;

      if (!answer || !answer.length) {
        // Disallow empty answers to required questions
        if (question.required) {
          error = SignupFieldError.MISSING;
        }
        // Normalize empty answers to "" or [], depending on question type
        answer = question.type === "checkbox" ? [] : "";
      } else if (question.type === "checkbox") {
        // Ensure checkbox answers are arrays
        if (!Array.isArray(answer)) {
          error = SignupFieldError.WRONG_TYPE;
        } else {
          // Check that all checkbox answers are valid
          answer.forEach((option) => {
            if (!question.options!.includes(option)) {
              error = SignupFieldError.NOT_AN_OPTION;
            }
          });
        }
      } else {
        // Don't allow arrays for non-checkbox questions
        if (typeof answer !== "string") {
          error = SignupFieldError.WRONG_TYPE;
        } else {
          switch (question.type) {
            case "text":
            case "textarea":
              break;
            case "number":
              // Check that a numeric answer is valid
              if (!Number.isFinite(parseFloat(answer))) {
                error = SignupFieldError.NOT_A_NUMBER;
              }
              break;
            case "select": {
              // Check that the select answer is valid
              if (!question.options!.includes(answer)) {
                error = SignupFieldError.NOT_AN_OPTION;
              }
              break;
            }
            default:
              throw new Error("Invalid question type");
          }
        }
      }

      if (error) {
        errors.answers ??= {};
        errors.answers[question.id] = error;
      }

      return {
        questionId: question.id,
        answer,
        signupId: signup.id,
      };
    });

    if (Object.keys(errors).length > 0) {
      throw new SignupValidationError("Errors validating signup", errors);
    }

    const updated = await updateSignup(signup, fields, newAnswers, transaction);
    await request.logEvent(AuditEvent.EDIT_SIGNUP, { signup, event, transaction });
    return { updatedSignup: updated, edited: !notConfirmedYet };
  });

  // Send the confirmation email
  sendSignupConfirmationMail(updatedSignup, edited ? "edit" : "signup");

  reply.status(200);
  return {
    id: updatedSignup.id,
  };
}

export async function updateSignupAsAdmin(
  request: FastifyRequest<{ Params: SignupPathParams; Body: AdminSignupUpdateBody }>,
  reply: FastifyReply,
): Promise<SignupUpdateResponse> {
  const updatedSignup = await getSequelize().transaction(async (transaction) => {
    const { signup, event } = await getSignupAndEventForUpdate(request.params.id, transaction);

    // In admin mode, do bare minimum validation.
    // The DB schema doesn't guarantee consistency anyway when questions are edited, which admins can also do.
    const fields: Partial<Signup> = {};
    if (request.body.firstName != null) fields.firstName = request.body.firstName;
    if (request.body.lastName != null) fields.lastName = request.body.lastName;
    if (request.body.namePublic != null) fields.namePublic = request.body.namePublic;
    if (request.body.email != null) fields.email = request.body.email;
    if (request.body.language != null) fields.language = request.body.language;

    // Normalize answer types and only keep ones to existing questions
    const newAnswers = event.questions!.map((question) => {
      // Fetch the answer to this question from the request body
      let answer = request.body.answers?.find((a) => a.questionId === question.id)?.answer;
      if (!answer || !answer.length) {
        // Normalize empty answers to "" or [], depending on question type
        answer = question.type === "checkbox" ? [] : "";
      } else if (question.type === "checkbox") {
        // Forcibly convert checkbox answers to array
        answer = !Array.isArray(answer) ? [answer] : answer;
      } else {
        // Forcibly convert non-checkbox answers to string
        answer = Array.isArray(answer) ? answer.join(", ") : answer;
      }
      return {
        questionId: question.id,
        answer,
        signupId: signup.id,
      };
    });

    const updated = updateSignup(signup, fields, newAnswers, transaction);
    await request.logEvent(AuditEvent.EDIT_SIGNUP, { signup, event, transaction });
    return updated;
  });

  if (request.body.sendEmail ?? true) sendSignupConfirmationMail(updatedSignup, "adminEdit");

  reply.status(200);
  return {
    id: updatedSignup.id,
  };
}
