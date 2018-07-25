import React, { Component } from "react";

  const QuizAnswer = props => {
    const handleClick = () => {
      props.handleClick(props.index, props.question);
    }
    const className = () => {
      let name = props.className+'Answer ';
      if (props.selected) name+= props.className+'Selected ';
      if (props.classes) name+= props.className+props.classes.join(' '+props.className)+' ';
      return name;
    }
    return (
      <li onClick={handleClick} className={className()}>{props.text}</li>
    )
  };

class Quiz extends Component {
  constructor(props) {
    super(props);

    let {questions, questionsPerPage, currentPage, inProgress, beforeStart, afterStart, score, penalty, autoEval, endEval, hideEndEval, className, header, footer, beginButton, evaluateButton, continueButton, finishButton, startMessage, finishMessage, pageLabel, scoreLabel, overallScoreLabel, evalHandler, outcomeHandler, ...userProps} = this.props;

    this.state = {
      questions: this.prepareQuestions(questions),
      questionsPerPage: questionsPerPage === 'all' ? questions.length : (questionsPerPage || 1),
      currentPage: currentPage!==undefined ? currentPage : -1,
      inProgress: currentPage!==undefined && currentPage>-1 ? true : (inProgress || false),
      beforeStart,
      afterStart,
      score: score!==undefined ? score : 0,
      penalty: penalty || 0,
      autoEval: autoEval || false,
      endEval: endEval!==undefined ? endEval : true,
      hideEndEval: hideEndEval || false,
      className: className || 'QuizMaster',
      userProps: userProps,
      header,
      footer,
      beginButton: beginButton || 'Begin',
      evaluateButton: evaluateButton || 'Evaluate',
      continueButton: continueButton || 'Continue',
      finishButton: finishButton || 'Finish',
      startMessage: startMessage || 'Click to begin!',
      finishMessage: finishMessage || 'Quiz complete!',
      pageLabel : pageLabel || 'Page: ',
      scoreLabel : scoreLabel || 'Score: ',
      overallScoreLabel: overallScoreLabel || 'Overall Score: ',
      evalHandler,
      outcomeHandler
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
    let {endEval} = this.state;
    this.setState({inProgress:false, currentPage:-2, finished:true}, endEval ? this.evaluate(-1) : null );
    this.state.finishCallback ? this.state.finishCallback() : null;
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
      multiSelect = questions[qIndex].multiSelect!==undefined ? questions[qIndex].multiSelect : multiSelect;
      answer.selected = i===aIndex ? !answer.selected : (multiSelect?answer.selected:false);
      return answer;
    });
    this.setState({questions}, autoEval ? this.evaluate(qIndex) : null);
  };

  evaluate = (index) => {
    let {questions, score, penalty, multiSelect, evalHandler} = this.state;
    questions = questions.map(evalHandler?evalHandler:(question, i) => {
      let displayed = index>-1 ? question.displayed : true;
      let indexed = typeof index !== 'number' || index === -1 || i === index;
      if (!displayed || question.submitted || !indexed) return question;
      question.attempts = question.attempts ? question.attempts-1 : 0;
      let selected = question.answers.filter(answer=>answer.selected);
      let correct = question.answers.filter(answer=>answer.correct);
      multiSelect = question.multiSelect!==undefined ? question.multiSelect : multiSelect;
      if (multiSelect!=='all' && selected.find(answer=>answer.correct)) question.correct = true;
      if (multiSelect==='all' && selected.every(answer=>answer.correct) && correct.every(answer=>answer.selected)) question.correct = true;
      if (question.attempts===0 || question.correct === true) question.submitted = true;
      if (question.correct) {
        question.pointsEarned = selected.reduce((a,b)=>b.correct&&b.points?a+b.points:a,0) || question.possiblePoints || 1;
        score += question.pointsEarned;
      } else {
        if (penalty) score -= penalty;
      }
      if (question.submitted) question.answers.map(answer=>{
        answer.classes = answer.classes || [];
        answer.classes.push(answer.correct ? (answer.selected?'CorrectAnswer':'MissingAnswer') : (answer.selected?'IncorrectAnswer':''))
        return answer;
      });
      return question;
    });
    this.setState({questions, score});
  };

  setDisplayedQuestions = () => {
    let {questions, questionsPerPage, currentPage} = this.state;
    let start = currentPage * questionsPerPage;
    let end = start+questionsPerPage>questions.length ? start+questions.length%questionsPerPage : start+questionsPerPage;
    questions = questions.map((question, i)=>{
      question.displayed = (i>=start && i<end);
      return question;
    });
    this.setState({questions});
  };

  renderQuizQuestions = () => {
    let {questions, currentPage, questionsPerPage, autoEval, endEval, finished, className, evaluateButton, continueButton, finishButton} = this.state;
    let totalQuestions = questions.length;
    let unsubmitted = questions.filter(question=>question.displayed && !question.submitted).length;
    let unanswered = questions.filter(question=>question.displayed && question.answers.filter(answer=>answer.selected).length===0).length;
    let finishedPage = questions.every(question=>question.submitted);
    questions = questions.filter(question=>question.displayed).map((question, i)=>(
      <div className={className+'Question'+(finished?' '+className+(question.correct?'Correct':'Incorrect'):'')} key={i}>
        <span>{question.prompt}</span>
        <ul>
          {question.answers.map((answer, j)=>(
            <QuizAnswer key={j} index={j} question={questionsPerPage*currentPage+i} text={answer.text} selected={answer.selected} submitted={question.submitted} className={className} classes={answer.classes} handleClick={this.handleAnswerClick} />
          ))}
        </ul>
      </div>
    ));

    if (!finished && unsubmitted>0 && !autoEval && !endEval) questions.push(<div key='evalButton'><button disabled={unanswered>0} onClick={this.evaluate}>{evaluateButton}</button></div>);
    if (!finishedPage && (unsubmitted===0 || (endEval && (currentPage+1)*questionsPerPage<totalQuestions))) questions.push(<div key='continueButton'><button disabled={unanswered>0} onClick={this.nextPage}>{continueButton}</button></div>);
    if (!finished && (finishedPage || (endEval && (currentPage+1)*questionsPerPage>=totalQuestions))) questions.push(<div key='finishButton'><button disabled={unanswered>0} onClick={this.finishQuiz}>{finishButton}</button></div>);
    return questions;
  };

  renderQuizPage = () => {
    return this.renderQuizQuestions();
  };

  renderQuizStart = () => {
    let {startMessage, beginButton} = this.state;
    return (
      <>
      <p><span>{startMessage}</span></p>
      <p><button onClick={this.startQuiz}>{beginButton}</button></p>
      </>
    );
  }

  renderQuizFinish = () => {
    let {finishMessage, score, questions, endEval, hideEndEval, className, outcomeHandler} = this.state;
    questions = questions.map(question=>{question.displayed=true; return question});
    return (
      <>
      <p><span>{finishMessage}</span></p>
      {endEval && !hideEndEval?(
        <div className={className+'EndEval'}>
        {this.renderQuizQuestions()}
        </div>
      ):('')}
      {outcomeHandler ? outcomeHandler(questions) : ''}
      {score!==false?(
        <p>{overallScoreLabel}{score}</p>
      ):('')}
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
    let {score, questions, currentPage, inProgress, finished, pageLabel} = this.state;
    if (this.props.header) return this.renderUserString(typeof this.props.header === 'function' ? this.props.header(this.state) : this.props.header);
    return (
      <span>{inProgress&&!finished?pageLabel+(currentPage+1):''}</span>
    )
  };

  renderQuizFooter = () => {
    let {score, questions, inProgress, finished, scoreLabel} = this.state;
    if (this.props.footer) return this.renderUserString(typeof this.props.footer === 'function' ? this.props.footer(this.state) : this.props.footer);
    return (
      <span>{inProgress&&!finished?scoreLabel+score:''}</span>
    )
  };

  renderUserString = (string) => {
    if (typeof string !== 'string') {
      string = React.cloneElement(string, {children:this.renderUserString(string.props.children)});
      return string;
    }
    let vars = Object.assign({},this.state);
    vars.currentPage = vars.currentPage+1;
    vars.totalQuestions = vars.questions.length;
    string = string.replace(/\[\[/g,"{").replace(/\]\]/g,"}");
    return string.replace(/\{(\w+)\}/g,(_,k)=>vars[k]!==undefined?vars[k]:vars.userProps[k]||'');
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
