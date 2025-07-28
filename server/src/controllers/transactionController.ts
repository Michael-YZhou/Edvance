import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is required but was not found in the environment variables."
  );
}

// create a new stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripePaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  let { amount } = req.body;

  if (!amount || amount <= 0) {
    amount = 50;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });
    res.status(200).json({
      message: "",
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating stripe payment intent", error: error });
  }
};

export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId, transactionId, amount, paymentProvider } = req.body;

  try {
    // get course info from the database so we know the course exists
    const course = await Course.get(courseId);

    // create transaction record in the database
    const newTransaction = new Transaction({
      dataTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      amount,
      paymentProvider,
    });
    await newTransaction.save();

    // create a initial course progress for the user
    const initialProgress = new UserCourseProgress({
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })),
      })),
      lastAccessed: new Date().toISOString(),
    });
    await initialProgress.save();

    // add the user to the course's enrolledUsers array
    await Course.update(
      { courseId },
      {
        $ADD: {
          enrolledUsers: [{ userId }],
        },
      }
    );

    res.json({
      message: "Purchased course successfully",
      data: {
        transaction: newTransaction,
        courseProgress: initialProgress,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error creating transaction and enrollment",
        error: error,
      });
  }
};
