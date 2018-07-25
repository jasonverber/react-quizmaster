import React from "react";
import { render } from "react-dom";
import {Quiz} from "../../lib";
import "./styles.css";

const evalHandler = (question) => {
  question.submitted=true;
  return question;
};

const outcomeHandler = (questions) => {
  if (questions[0].answers[0].selected && questions[1].answers[0].selected && questions[2].answers[1].selected) return <p>You're an exclamation point!</p>;
  if (questions[1].answers[1].selected && questions[2].answers[1].selected) return <p>You're an em-dash!</p>;
  if (questions[0].answers[1].selected && questions[1].answers[0].selected) return <p>You're a question mark!</p>
  return <p>You're a semi-colon!</p>;
}

function Demo() {
  return (
    <div>
      <h1>Demo Graded Quiz</h1>
      <Quiz header=<h2>[[title]]</h2>
            footer={(state)=>state.currentPage>-1?<p>Score: [[score]] - Page: [[currentPage]]</p>:''}
            title='Geography Quiz'
            questionsPerPage='all'
            questions={[
                        {
                          prompt: 'What is the capital of Germany?',
                          answers: ['Frankfurt','Bonn',{text: 'Berlin', correct:true},'Munich']
                        },
                        {
                          prompt: 'What was the capital of West Germany?',
                          answers: ['Frankfurt',{text:'Bonn', correct:true},{text: 'Berlin', correct:false},'Munich']
                        },{
                          prompt: 'Which cities have been the capital of the Federal Republic of Germany?',
                          answers: ['Frankfurt',{text:'Bonn', correct:true, points:1},{text: 'Berlin', correct:true, points:1},'Munich'],
                          multiSelect:'all'
                        }]} />


      <h1>Demo Ungraded Quiz</h1>
      <Quiz header=<h2>[[title]]</h2>
            footer={(state)=>state.currentPage>-1?<p>Page: [[currentPage]]</p>:''}
            title='Which Punctuation Mark Are You?'
            questionsPerPage={1}
            evalHandler={evalHandler}
            outcomeHandler={outcomeHandler}
            finishMessage='And the results are in...'
            hideEndEval={true}
            score={false}
            className='SurveyMaster'
            questions={[
                        {
                          prompt: 'What is your outlook?',
                          answers: ['Optimistic','Pessimistic']
                        },
                        {
                          prompt: 'Does your life have a point?',
                          answers: ['Yes','No']
                        },{
                          prompt: 'Do people talk over you, or give you space in a conversation?',
                          answers: ['Talk over.','Give space.','It depends.']
                        }]} />

    </div>
  );
}

render(<Demo />, document.getElementById("app"));
