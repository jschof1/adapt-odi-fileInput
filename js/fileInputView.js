import QuestionView from 'core/js/views/questionView';
import Papa from './csvToJson';

export default class fileInputView extends QuestionView {

 events() {
  return{
    'focus .js-item-input': 'onItemFocus',
    'blur .js-item-input': 'onItemBlur',
    'change .js-item-input': 'onInputChanged',
    'keyup .js-item-input': 'onKeyPress'
  };
 }


  resetQuestionOnRevisit() {
    this.resetQuestion();
  }

  setupQuestion() {
    this.model.setupRandomisation();
  }

  onQuestionRendered() {
    this.setReadyStatus();
  }

  onItemFocus(event) {
    if (!this.model.isInteractive()) return;

    const index = parseInt($(event.currentTarget).data('adapt-index'));
    const item = this.model.getChildren().findWhere({ _index: index });
    item.set('_isHighlighted', true);
  }

  onItemBlur(event) {
    const index = $(event.currentTarget).data('adapt-index');
    const item = this.model.getChildren().findWhere({ _index: index });
    item.set('_isHighlighted', false);
  }

  

  // Used by the question view to reset the look and feel of the component.
  resetQuestion() {
    this.model.resetActiveItems();
    this.model.resetItems();
  }

  showCorrectAnswer() {
    this.model.set('_isCorrectAnswerShown', true);
  }

  hideCorrectAnswer() {
    this.model.set('_isCorrectAnswerShown', false);
  }

  getFile(){
    const $itemInput = this.$('.js-item-input').eq(0);
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

  const item = this.model.get('_items')[0];
  item._score = points;

  console.log(item)
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
  this.model.get('_items')[0].feedback = arrResults
  this.model.get('_feedback').correct = arrResults
  this.model.get('_feedback')._incorrect.final = arrResults
  this.model.get('_feedback')._partlyCorrect.final = arrResults
 return $('#feedback').text(arrResults)

 }
 async onInputChanged(e) {

  if (!this.model.isInteractive()) return;

  const index = $(e.currentTarget).data('adapt-index');
  const itemModel = this.model.getItem(index);
  let shouldSelect = !itemModel.get('_isActive');

  if (this.model.isSingleSelect()) {
    // Assume a click is always a selection
    shouldSelect = true;
    this.model.resetActiveItems();
  } else if (shouldSelect && this.model.isAtActiveLimit()) {
    // At the selection limit, deselect the last item
    this.model.getLastActiveItem().toggleActive(false);
  }

  // Select or deselect accordingly
  itemModel.toggleActive(shouldSelect);

   let userResult = await this.checkTest()
    this.feedback()
    const $input = $(e.target)
    let result = await this.getFile()
    this.createTable(result.data)
    // this.model.setItemUserAnswer($input.parents('.js-item-input').index(), userResult);
  }
}

