# Quizmaster React Component

A lightweight quiz component for React with a variety of configuration options.

Basic usage:
```javascript
<Quiz questions={arrayOfQuestions} />
```

## Required properties

`arrayOfQuestions` must be an array of question objects with the following required properties:
- `prompt`: the question itself.
- `answers`: an array of answers, either strings or objects(`{text: ''}`). Answer objects may also have a boolean `correct` property as well as a numeric `points` property.

Optional properties for the questions include:
- `points`: the number of points the question is worth. Overrides the `points` property.
- `multiSelect`: boolean - can more than one answer be selected? Overrides the `multiSelect` property.

Optional properties for the answers include:
- `correct`: boolean - whether this answer is correct or not.
- `points`: the number of points this answer is worth. Overrides all other `points` values.

## Optional properties

Optional properties include:

- `points`: the point value for all questions (unless overridden by a question or its answer)
- `multiSelect`: boolean - whether more than one answer can be selected (unless overridden by a question)
- `questionsPerPage`: An integer or 'all'.
- `startCallback` and `finishCallback`: functions to call when the quiz starts and ends.
- `score`: starting score. If `false`, score will not be displayed.
- `penalty`: points to deduct for incorrect answers.
- `autoEval`: boolean - should clicking an answer immediately trigger evaluation of the questions?
- `endEval`: boolean - should questions be evaluated at the very end instead of each page?
- `hideEndEval`: boolean - should the evaluated questions be hidden at the end? Useful for custom evaluation and outcome handlers, see below.
- `className`: CSS base class for the quiz. Defaults to 'QuizMaster'
- `header` and `footer`: Text or HTML to display in the header and footer.
- `beginButton`, `evaluateButton`, `continueButton`, and `finishButton`: labels for buttons.
- `startMessage`, `finishMessage`: messages displayed before and after the quiz.
- `pageLabel`, `scoreLabel`, `overallScoreLabel`: labels for current page, score, and overall score at the end.
- `evalHandler`: A custom handler for evaluation of individual questions, returning the evaluated question (`(question)=>question`). Selected `answers` will have the `selected` property set to `true`. Setting `question.submitted` to `true` will prevent further attempts and re-evaluation.
- `outcomeHandler`: A custom handler for the final outcome, returning text or HTML. Takes the array of questions and answers, with the `selected` property indicating which answers have been selected. `(questions)=>'Outcome'`
