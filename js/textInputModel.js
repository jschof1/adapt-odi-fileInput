import QuestionModel from 'core/js/models/questionModel';

class TextInputModel extends QuestionModel {

  init() {
    super.init();

    this.set('_genericAnswerIndexOffset', TextInputModel.genericAnswerIndexOffset);

    this.setupQuestionItemIndexes();
    this.checkCanSubmit();
  }

  /**
   * @param {string} [type] 'hard' resets _isComplete and _isInteractionComplete, 'soft' resets _isInteractionComplete only.
   * @param {boolean} [canReset] Defaults to this.get('_canReset')
   * @returns {boolean}
   */
  reset(type = 'hard', canReset = this.get('_canReset')) {
    const wasReset = super.reset(type, canReset);
    if (!wasReset) return false;
    this.set({
      _isAtLeastOneCorrectSelection: false,
      _isCorrect: null
    });
    return true;
  }

  setupQuestionItemIndexes() {
    this.get('_items').forEach((item, index) => {
      if (item._index === undefined) item._index = index;
      if (item._answerIndex === undefined) item._answerIndex = -1;
    });
  }


  restoreUserAnswers() {
    if (!this.get('_isSubmitted')) return;

    const userAnswer = this.get('_userAnswer');
    const genericAnswers = this.get('_answers');
    this.get('_items').forEach(item => {
      const answerIndex = userAnswer[item._index];
      if (answerIndex >= TextInputModel.genericAnswerIndexOffset) {
        item.userAnswer = genericAnswers[answerIndex - TextInputModel.genericAnswerIndexOffset];
        item._answerIndex = answerIndex;
      } else if (answerIndex > -1) {
        item.userAnswer = item._answers[answerIndex];
        item._answerIndex = answerIndex;
      } else {
        if (item.userAnswer === undefined) item.userAnswer = '******';
        item._answerIndex = -1;
      }
      if (item.userAnswer instanceof Array) item.userAnswer = item.userAnswer[0];
    });

    this.setQuestionAsSubmitted();
    this.markQuestion();
    this.setScore();
    this.setupFeedback();
  }

  setupRandomisation() {
    if (!this.get('_isRandom') || !this.get('_isEnabled')) return;

    this.set('_items', _.shuffle(this.get('_items')));
  }

  // Use to check if the user is allowed to submit the question
  canSubmit() {
    // can submit if every item has user input

    return this.get('_items').every(({ userAnswer }) => userAnswer);
  }

  setItemUserAnswer(itemIndex, userAnswer) {
    const item = this.get('_items')[itemIndex];
    item.userAnswer = userAnswer;
    this.checkCanSubmit();
  }

  // Preserves the state for returning or showing the user's answers
  // storeUserAnswer() {
  //   const items = this.get('_items');

  //   this.isCorrect();

  //   const userAnswer = new Array(items.length);
  //   items.forEach(({ _index, _answerIndex }) => (userAnswer[_index] = _answerIndex));
  //   this.set('_userAnswer', userAnswer);
  // }

  isCorrect() {
    if (this.get('_answers')) {
      this.markGenericAnswers();
    } else {
      this.markSpecificAnswers();
    }
    return this.get('_items').every(({ _isCorrect }) => _isCorrect);
  }

  isPartlyCorrect() {
    return this.get('_isAtLeastOneCorrectSelection');
  }

  // Allows the learner to give answers into any input, ignoring the order.
  // (this excludes any inputs which have their own specific answers).
  markGenericAnswers() {
    let numberOfCorrectAnswers = this.get('_items')[0].userAnswer.points;
    console.log(numberOfCorrectAnswers)
    const correctAnswers = this.get('_answers').slice();
    const usedAnswerIndexes = [];

    this.set({
      _numberOfCorrectAnswers: numberOfCorrectAnswers,
      _isAtLeastOneCorrectSelection: true
    });

    if (points >= 1) {
      item._isCorrect = true;
    }
    else {
      item._isCorrect = false
    }
    if (!item._isCorrect) item._isCorrect = false;
  }

  markSpecificAnswers() {
    let numberOfCorrectAnswers = this.get('_items')[0].userAnswer.points;
    const answers = this.get('_items')[0].userAnswer.userResults
    console.log(this.get('_items'))
    if (!answers) return;
    const userAnswer = this.get('_items')[0].userAnswer.userResults;
    if (numberOfCorrectAnswers > 0) {
      this.get('_items')[0].isCorrect = true
    }
    if (!numberOfCorrectAnswers < 1) return;
    // this.get('_items')[0]._answerIndex = answers.indexOf(this.cleanupUserAnswer(userAnswer));
    this.set({
      _numberOfCorrectAnswers: numberOfCorrectAnswers,
      _isAtLeastOneCorrectSelection: true
    });

  }



  // Used to set the score based upon the _questionWeight
  setScore() {
    const numberOfCorrectAnswers = this.get('_items')[0].userAnswer.points;
    const questionWeight = this.get('_questionWeight');
    // const itemLength = this.get('_items').length;


    const score = questionWeight * numberOfCorrectAnswers
    this.set('_score', score);

  }

  /**
  * used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
  * returns the user's answers as a string in the format 'answer1[,]answer2[,]answer3'
  * the use of [,] as an answer delimiter is from the SCORM 2004 specification for the fill-in interaction type
  */
  getResponse() {
    const answers = this.get('_items')[0].userAnswer.userResults
    let arrResults
    for (let i of answers) {
      arrResults = `${Object.values(i)}`
    }
    return arrResults
  }

  /**
  * used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
  */
  getResponseType() {
    return 'fill-in';
  }

}

TextInputModel.genericAnswerIndexOffset = 65536;

export default TextInputModel;
