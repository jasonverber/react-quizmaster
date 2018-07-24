import React from "react";
import { render } from "react-dom";
import {Quiz, QuizQuestion, QuizAnswer} from "../../lib";
import "./styles.css";

function Demo() {
  return (
    <div>
      <h1>Demo</h1>
      <Quiz questionsPerPage='all' questions={[
        {
          prompt: 'What is the capital of Germany?',
          answers: ['Frankfurt','Bonn',{text: 'Berlin', correct:true},'Munich']
        },
        {
          prompt: 'What was the capital of West Germany?',
          answers: ['Frankfurt',{text:'Bonn', correct:true},{text: 'Berlin', correct:false},'Munich']
        }]} />
    </div>
  );
}

render(<Demo />, document.getElementById("app"));
