import QuestionView from 'core/js/views/questionView';
import Papa from './csvToJson';

export default class fileInputView extends QuestionView {

  events() {
    return {
      'focus .js-fileinput-filebox': 'clearValidationError',
      'change .js-fileinput-filebox': 'onInputChanged',
      'keyup .js-fileinput-filebox': 'onInputChanged'
    };
  }

  setupQuestion() {
    this.model.setupRandomisation();
  }

  disableQuestion() {
    this.setAllItemsEnabled(false);
  }

  enableQuestion() {
    this.setAllItemsEnabled(true);
  }

  setAllItemsEnabled(isEnabled) {
    this.model.get('_items').forEach((item, index) => {
      
      const $itemInput = this.$('.js-fileinput-filebox').eq(index);
      // console.log($itemInput[0].files[0]);
      $itemInput.prop('disabled', !isEnabled);
    });
  }

  onQuestionRendered() {
    this.setReadyStatus();
  }

  clearValidationError() {
    this.$('.js-fileinput-filebox').removeClass('has-error');
  }

  // Blank method for question to fill out when the question cannot be submitted
  onCannotSubmit() {
    this.showValidationError();
  }

  showValidationError() {
    this.$('.js-fileinput-filebox').addClass('has-error');
  }

  // This is important and should give the user feedback on how they answered the question
  // Normally done through ticks and crosses by adding classes
  showMarking() {
    if (!this.model.get('_canShowMarking')) return;
      const item = this.$('.js-fileinput-item')
      item.removeClass('is-correct is-incorrect').addClass(item._isCorrect ? 'is-correct' : 'is-correct');
    }

  // Used by the question view to reset the look and feel of the component.
  resetQuestion() {
    this.$('.js-fileinput-filebox').prop('disabled', !this.model.get('_isEnabled')).val('');

    this.model.set({
      _isAtLeastOneCorrectSelection: false,
      _isCorrect: undefined
    });
  }

  showCorrectAnswer() {
    // console.log(this.model.get('_feedback'))

    // if correct answers is true i.e. it exists then return correcAnsnwers
    // if it isnt then return 
    const correctAnswers = this.model.get('_answers');
    console.log(correctAnswers, item._answers[0])
    this.model.get('_items').forEach((item, index) => {
      const correctAnswer = correctAnswers ? correctAnswers[index][0] : item._answers[0];
      this.$('.js-fileinput-filebox').eq(index).val('yofamy');
    });
  }

  hideCorrectAnswer() {
    this.model.get('_items').forEach((item, index) => {
      this.$('.js-fileinput-filebox').eq(index).val(item.userAnswer);
    });
  }

  getFile(){
    const $itemInput = this.$('.js-fileinput-filebox').eq(0);
    function readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = res => {
          resolve(res.target.result);
        };
        reader.onerror = err => reject(err);
        return reader.readAsText(file);
      });
    }
    async function onSubmit() {
        const file = $itemInput[0].files[0]
        const contents = await readFile(file)
        let parse = await Papa.parse(contents, {
          header: true,
        });
        return parse
    }

    return onSubmit()
  }


// async convertCsv(){
//   let parse = await Papa.parse(this.getFile(), {
//     header: true,
//   });
// }

async createTable(input) {
    // gradeTotal += 1
    let col = [];
    for (let i = 0; i < input.length; i++) {
      for (let key in input[i]) {
        if (col.indexOf(key) === -1) {
          col.push(key);
        }
      }
    }

let table = document.createElement("table");
table.setAttribute('id', 'table');
let tr = table.insertRow(-1);
for (let i = 0; i < col.length; i++) {
  let th = document.createElement("th");
  th.innerHTML = col[i];
  tr.appendChild(th);
}
for (let i = 0; i < 8; i++) {
  tr = table.insertRow(-1);
  for (let j = 0; j < col.length; j++) {
    let tabCell = tr.insertCell(-1);
    tabCell.innerHTML = input[i][col[j]];
  }
}
let divContainer = document.getElementById("result");
divContainer.innerHTML = "";
divContainer.appendChild(table);
$('table').attr('id', 'table');
}

async checkTest(){
  let userResults = []
  let points = 0
  let result = await this.getFile()
  function checkRows(input, x) {
    let numRows = input.length;
    if (numRows == x) {
      console.log(true)
      userResults.push({'row':`✅  There are ${x} rows in the dataset. One point awarded.`});
      points += 1
    }
    else if (numRows !== x) {
      userResults.push({'row':`✏️  There are not ${x} rows in the dataset. No points awarded`});
    }
  }
  checkRows(Object.keys(result.data[0]), 7)

  let resultObj = {
    userResults: userResults,
    points  : points
  }
  return resultObj
}

 async feedback(){
  let userResult = await this.checkTest()
  let arrResults
  for (let i of userResult.userResults) {
    arrResults = `${Object.values(i)}`
  }
 return $('#feedback').file(arrResults)

 }
 async onInputChanged(e) {
   let userResult = await this.checkTest()
    this.feedback()
    const $input = $(e.target)
    let result = await this.getFile()
    this.createTable(result.data)
    this.model.setItemUserAnswer($input.parents('.js-fileinput-item').index(), userResult);
  }

}
