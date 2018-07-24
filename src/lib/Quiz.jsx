import React, { Component } from "react";

  const QuizAnswer = props => {
    const handleClick = () => {
      props.handleClick(props.index, props.question);
    }
    const style = () => {
      if (props.selected) return {fontWeight:'bold'};
      return {};
    }
    return (
      <li onClick={handleClick} style={Object.assign(style(),props.style||{})}>{props.text}</li>
    )
  };

class Quiz extends Component {
  constructor(props) {
    super(props);

    let {questions, questionsPerPage, currentPage, inProgress, beforeStart, afterStart, score, penalty, autoEval, className, ...userProps} = this.props;

    this.state = {
      questions: this.prepareQuestions(questions),
      questionsPerPage: questionsPerPage === 'all' ? questions.length : (questionsPerPage || 1),
      currentPage: currentPage!==undefined ? currentPage : -1,
      inProgress: currentPage!==undefined && currentPage>-1 ? true : (inProgress || false),
      beforeStart,
      afterStart,
      score: score || 0,
      penalty: penalty || 0,
      autoEval: autoEval || true,
      className: className || 'QuizMaster',
      userProps: userProps
    }
  }

  componentDidMount = () => {
    this.setDisplayedQuestions();
  }

  prepareQuestions = (questions) => {
    questions = questions.map(question=>{
      question.answers=question.answers.map(answer=>typeof answer === 'object' ? answer : {text:answer});
      return question;
    });
    return questions;
  };

  startQuiz = () => {
    this.setPage(0);
    this.state.startCallback ? this.state.startCallback() : null;
  };

  finishQuiz = () => {
    if (this.state.beforeFinish) this.state.beforeFinish();
    this.setState({inProgress:false, currentPage:-2, finished:true}, this.state.afterFinish||null);
  };

  setPage = (newPage) => {
    let {currentPage} = this.state;
    currentPage = newPage;
    this.setState({currentPage, inProgress:currentPage>-1}, this.setDisplayedQuestions);
  }

  nextPage = () => {
    let {currentPage} = this.state;
    this.setPage(currentPage+1);
  }

  handleAnswerClick = (aIndex, qIndex) => {
    let {questions, multiSelect, autoEval} = this.state;
    if (questions[qIndex].submitted) return;
    questions[qIndex].answers = questions[qIndex].answers.map((answer, i)=>{
      answer.selected = i===aIndex ? !answer.selected : (multiSelect?answer.selected:false);
      return answer;
    });
    this.setState({questions}, autoEval ? this.evaluate(qIndex) : null);
  };

  evaluate = (index) => {
    let {questions, score, penalty} = this.state;
    questions = questions.map((question, i) => {
      if (!question.displayed || question.submitted || (index!==undefined && i!==index)) return question;
      question.attempts = question.attempts ? question.attempts-1 : 0;
      let selected = question.answers.filter(answer=>answer.selected);
      let correct = question.answers.filter(answer=>answer.correct);
      if (selected.find(answer=>answer.correct)) question.correct = true;
      if (question.attempts===0 || question.correct === true) question.submitted = true;
      if (question.correct) {
        question.pointsEarned = questions.possiblePoints || 1;
        score += question.pointsEarned;
      } else {
        if (penalty) score -= penalty;
      }
      if (question.submitted) question.answers.map(answer=>{
        answer.style = answer.correct ? {color:'green', fontWeight:'bold'} : (answer.selected?{color:'red'}:{});
        return answer;
      });
      return question;
    });
    this.setState({questions, score});
  };

  setDisplayedQuestions = () => {
    let {questions, questionsPerPage, currentPage} = this.state;
    let start = currentPage * questionsPerPage;
    let end = start+questionsPerPage>questions.length ? start+questions.length%questionsPerPage : start+questionsPerPage; console.log("end "+end)
    questions = questions.map((question, i)=>{
      question.displayed = (i>=start && i<end);
      return question;
    });
    console.log(questions);
    this.setState({questions});
  };

  renderQuizQuestions = () => {
    let {questions, currentPage, questionsPerPage, autoEval} = this.state;
    let unsubmitted = questions.filter(question=>question.displayed && !question.submitted).length;
    let unanswered = questions.filter(question=>question.displayed && question.answers.filter(answer=>answer.selected).length===0).length;
    let finished = questions.every(question=>question.submitted);
    questions = questions.filter(question=>question.displayed).map((question, i)=>(
      <div key={i}>
        <span>{question.prompt}</span>
        <ul>
          {question.answers.map((answer, j)=>(
            <QuizAnswer key={j} index={j} question={questionsPerPage*currentPage+i} text={answer.text} selected={answer.selected} style={answer.style} handleClick={this.handleAnswerClick} />
          ))}
        </ul>
      </div>
    ));

    if (unsubmitted>0 && !autoEval) questions.push(<div key='evalButton'><button disabled={unanswered>0} onClick={this.evaluate}>Evaluate</button></div>);
    if (!finished && unsubmitted===0) questions.push(<div key='continueButton'><button onClick={this.nextPage}>Continue</button></div>);
    if (finished) questions.push(<div key='finishButton'><button onClick={this.finishQuiz}>Finish</button></div>);
    return questions;
  };

  renderQuizPage = () => {
    return this.renderQuizQuestions();
  };

  renderQuizStart = () => {
    let {startMessage} = this.state;
    return (
      <>
      <p><span>{startMessage || 'Click to begin!'}</span></p>
      <p><button onClick={this.startQuiz}>Begin</button></p>
      </>
    );
  }

  renderQuizFinish = () => {
    let {finishMessage, score} = this.state;
    return (
      <>
      <p><span>{finishMessage || 'Quiz complete!'}</span></p>
      <p>Overall Score: {score}</p>
      </>
    );
  }

  renderQuizBody = () => {
    let {finished, inProgress, currentPage} = this.state;
    if (finished) return this.renderQuizFinish();
    if (!inProgress || currentPage===-1) return this.renderQuizStart();
    if (currentPage>-1) return this.renderQuizPage();
  };

  renderQuizHeader = () => {
    let {score, questions, currentPage, inProgress, finished} = this.state;
    if (this.props.header) return this.props.header;
    return (
      <span>{inProgress&&!finished?'Page: '+(currentPage+1):''}</span>
    )
  };

  renderQuizFooter = () => {
    let {score, questions, inProgress, finished} = this.state;
    return (
      <span>{inProgress&&!finished?'Score: '+score:''}</span>
    )
  };

  renderUserString = (string) => {

  }

  render = () => {
    let {className, userProps, currentPage} = this.state;
    return (
      <div className={className} {...userProps}>
        <div className={className+'Header'}>
          {this.renderQuizHeader()}
        </div>
        <div className={className+'Body'}>
          {this.renderQuizBody()}
        </div>
        <div className={className+'Footer'}>
          {this.renderQuizFooter()}
        </div>
      </div>
    );
  }
}

export default Quiz;
