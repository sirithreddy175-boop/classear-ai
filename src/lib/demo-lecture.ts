import type { StudyMaterial } from "./study-types";

export const DEMO_CLASS_TITLE = "Introduction to Machine Learning";
export const DEMO_CLASS_SUBJECT = "Computer Science";
export const DEMO_CLASS_TEACHER = "Dr. Menon";
export const DEMO_DURATION_SECONDS = 2537;

export const DEMO_TRANSCRIPT = `[00:00:04] Alright everyone, settle in. Today we start machine learning properly. Put away the textbook for a minute — I want you to think about what learning actually means for a program.

[00:01:12] A traditional program is rules you write yourself. If the email contains "free money", mark it as spam. Machine learning flips that: you give the program examples of spam and not-spam, and it works out the rule itself. That is the entire shift.

[00:03:40] So the formal definition I want you to remember: a program learns from experience E on task T with performance measure P if its performance at T, measured by P, improves with E. Tom Mitchell's definition. It will appear in your exam, so write it down properly.

[00:06:55] There are three broad families. Supervised learning — labelled data, you know the answer for each example. Unsupervised learning — no labels, the model finds structure. Reinforcement learning — an agent acts, gets reward or penalty, and improves its policy.

[00:09:30] Supervised learning splits again into classification and regression. Classification predicts a category: spam or not spam, benign or malignant. Regression predicts a number: house price, tomorrow's temperature.

[00:13:15] Let me give you the example I always use. Suppose I collect data on a thousand houses — area, number of bedrooms, distance from the city centre — and the price each sold for. Area and bedrooms are features. Price is the label. Feed that to a regression model and it learns a function from features to price.

[00:17:02] Now the important part, and this is where most students lose marks. Overfitting. Overfitting is when the model memorises the training data instead of learning the pattern. It scores beautifully on data it has already seen and fails on anything new.

[00:19:20] Think of a student who memorises last year's question paper word for word. Perfect on that paper. Useless on this year's. That is overfitting. The opposite is underfitting — the model is too simple to capture the pattern at all, so it does badly everywhere.

[00:23:45] How do we detect it? Split your data. Training set to fit the model, validation set to tune it, test set touched only once at the end. If training accuracy is very high and validation accuracy is low, you are overfitting. That gap is the signal.

[00:27:10] Remedies: get more data, simplify the model, use regularisation, use cross-validation, stop training early. Regularisation is just a penalty on complexity — you make the model pay for being complicated.

[00:32:00] Quick word on the bias-variance trade-off. High bias means systematically wrong assumptions — that is underfitting. High variance means wildly sensitive to the particular training sample — that is overfitting. Good models sit in between.

[00:36:30] Unsupervised learning, briefly. Clustering groups similar items — customer segments, for example. Dimensionality reduction, like PCA, compresses features while keeping most of the variation. We will do PCA properly in week seven.

[00:39:50] A realistic workflow, because interviewers ask this: define the problem, collect data, clean data, engineer features, choose a model, train, evaluate, tune, deploy, monitor. Notice that cleaning and features take most of the time, not the fancy modelling.

[00:41:15] Accuracy is not always the right measure. If one percent of emails are spam, a model that says "never spam" is ninety-nine percent accurate and completely useless. Use precision, recall and F1 when classes are imbalanced.

[00:42:17] For next class: read chapter two, and try to write down three problems from your own life that are supervised, unsupervised and reinforcement. That is it, see you Thursday.`;

export const DEMO_MATERIAL: StudyMaterial = {
  summary:
    "This class introduced machine learning as a shift from hand-written rules to learning patterns from examples. It covered Mitchell's formal definition, the three families of learning (supervised, unsupervised, reinforcement), the classification/regression split, and then spent most of the time on overfitting: what it is, how to detect it with a train/validation/test split, and how to fix it. It closed with the bias-variance trade-off, a short look at clustering and PCA, the real-world ML workflow, and why accuracy is a poor metric on imbalanced data.",
  keyPoints: [
    "Machine learning replaces hand-written rules with patterns learned from labelled examples.",
    "Mitchell's definition: a program learns from experience E at task T measured by P if performance improves with E.",
    "Three families: supervised (labelled), unsupervised (no labels), reinforcement (reward and penalty).",
    "Supervised learning splits into classification (categories) and regression (numbers).",
    "Overfitting = memorising training data; underfitting = model too simple for the pattern.",
    "A large gap between training and validation accuracy is the signal for overfitting.",
    "Fixes for overfitting: more data, simpler model, regularisation, cross-validation, early stopping.",
    "Accuracy misleads on imbalanced data — use precision, recall and F1 instead.",
  ],
  concepts: [
    {
      name: "Supervised learning",
      explanation:
        "Learning from data where every example already carries the correct answer (a label), so the model learns a mapping from features to that answer.",
      teacherExplanation:
        "You give the program examples of spam and not-spam, and it works out the rule itself.",
    },
    {
      name: "Overfitting",
      explanation:
        "The model fits the training data too closely, capturing noise instead of the underlying pattern, so it performs poorly on unseen data.",
      teacherExplanation:
        "Like a student who memorises last year's question paper word for word — perfect on that paper, useless on this year's.",
    },
    {
      name: "Underfitting",
      explanation:
        "The model is too simple to represent the pattern in the data, so it performs badly on both training and unseen data.",
      teacherExplanation: "The model is too simple to capture the pattern at all.",
    },
    {
      name: "Train / validation / test split",
      explanation:
        "Data is divided so the model is fitted on one part, tuned on a second, and judged once on a third that it has never seen.",
      teacherExplanation:
        "Training set to fit, validation set to tune, test set touched only once at the end.",
    },
    {
      name: "Regularisation",
      explanation:
        "A penalty added to the training objective that discourages unnecessary model complexity.",
      teacherExplanation: "You make the model pay for being complicated.",
    },
    {
      name: "Bias-variance trade-off",
      explanation:
        "High bias means wrong assumptions and underfitting; high variance means over-sensitivity to the training sample and overfitting. Good models balance both.",
    },
  ],
  examples: [
    "Spam filtering: instead of writing the rule 'contains free money → spam', the model learns it from labelled emails.",
    "House price prediction: area, bedrooms and distance from the centre are features; the sale price is the label — a regression problem.",
    "The memorised question paper analogy for overfitting.",
    "The imbalanced spam dataset where predicting 'never spam' gives 99% accuracy and zero usefulness.",
  ],
  importantNotes: [
    "Mitchell's definition was explicitly flagged as exam material — memorise the exact wording.",
    "Overfitting is where most students lose marks; be able to define it, detect it and fix it.",
    "The test set must be used only once, at the very end.",
    "Data cleaning and feature engineering take most of the real project time, not modelling.",
    "PCA will be covered properly in week seven.",
  ],
  questions: [
    {
      type: "short",
      question: "State Mitchell's definition of machine learning.",
      answer:
        "A program learns from experience E with respect to task T and performance measure P if its performance at T, as measured by P, improves with experience E.",
    },
    {
      type: "short",
      question: "Name the three broad families of machine learning.",
      answer: "Supervised learning, unsupervised learning and reinforcement learning.",
    },
    {
      type: "conceptual",
      question: "Explain the difference between overfitting and underfitting, and how each is detected.",
      answer:
        "Overfitting means the model memorises training data: training accuracy is high while validation accuracy is much lower. Underfitting means the model is too simple: performance is poor on both training and validation data.",
    },
    {
      type: "conceptual",
      question:
        "Why is accuracy a poor performance measure when one class is very rare, and what should be used instead?",
      answer:
        "A trivial model that always predicts the majority class scores high accuracy while never detecting the rare class. Precision, recall and F1 reveal that failure.",
    },
    {
      type: "mcq",
      question: "Predicting tomorrow's temperature from historical weather data is an example of:",
      options: ["Classification", "Regression", "Clustering", "Reinforcement learning"],
      answer: "Regression",
    },
    {
      type: "mcq",
      question: "Which of the following is NOT a remedy for overfitting discussed in class?",
      options: [
        "Regularisation",
        "Cross-validation",
        "Increasing model complexity",
        "Early stopping",
      ],
      answer: "Increasing model complexity",
    },
  ],
  revisionNotes: [
    "ML = learn the rule from examples, don't write the rule.",
    "Supervised → labels. Classification → category. Regression → number.",
    "Unsupervised → no labels. Clustering → groups. PCA → fewer features, most variation kept.",
    "Reinforcement → act, get reward, improve policy.",
    "Overfit = high train / low validation. Underfit = low / low.",
    "Fix overfit: more data · simpler model · regularise · cross-validate · stop early.",
    "Bias = wrong assumptions (underfit). Variance = sample-sensitive (overfit).",
    "Workflow: problem → data → clean → features → model → train → evaluate → tune → deploy → monitor.",
    "Imbalanced classes → precision, recall, F1 — not accuracy.",
  ],
  resources: [
    {
      title: "Tom Mitchell — formal definition of learning",
      kind: "Search topic",
      why: "The exact definition the teacher flagged for the exam.",
    },
    {
      title: "Bias-variance trade-off explained",
      kind: "Search topic",
      why: "Connects underfitting and overfitting into one framework.",
    },
    {
      title: "Cross-validation (k-fold) tutorial",
      kind: "Search topic",
      why: "The main technique mentioned for detecting overfitting reliably.",
    },
    {
      title: "Precision, recall and F1 score for imbalanced data",
      kind: "Search topic",
      why: "Covers the final point of the lecture about misleading accuracy.",
    },
    {
      title: "Principal Component Analysis (PCA) basics",
      kind: "Search topic",
      why: "Preparation for week seven, which builds on this class.",
    },
  ],
};
