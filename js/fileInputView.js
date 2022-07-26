import QuestionView from 'core/js/views/questionView';
import Papa from './csvToJson';
import Ajv from './ajv7.min.js';
// import DataTable from './jquery.dataTables.min.js';


export default class fileInputView extends QuestionView {

  events() {
    return {
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

  getFile() {
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
        header: true
      });
      let fileObj = await { parse: parse, contents: contents }
      return await fileObj
    }

    return onSubmit()
  }

  async createTable(input) {

    // var tableData = [];

    //values
    // for (var i = 0; i < input.length; i++) {
    //   var record = input[i];
    //   var recordVals = [];
    //   var numCols = Object.keys(record).length;
    //   for (var j = 0; j < numCols; j++) {
    //     var key = Object.keys(record)[j];
    //     var value = record[key];
    //     recordVals.push(value);
    //   }
    //   tableData.push(recordVals);
    // }

    //columns
    let col = [];
    for (let i = 0; i < input.length; i++) {
      for (let key in input[i]) {
        if (col.indexOf(key) === -1) {
          col.push(key);
        }
      }
    }


    //get headers
    let tableHeader = [];
    for (var i in col) {
      tableHeader.push({ title: col[i] });
    }

    // document.ready( "DOMContentLoaded", completed );
    // $('result').this.DataTable({
    //   "dom": '<"top"ip>rt<"clear">',
    //   data: tableData, // extract this from input file
    //   columns: tableHeader,
    // });


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


  async checkCsvStructure() {

    let result = await this.getFile()
    const lineBreaks = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_line_breaks = [];
      for (let i = 0; i < csv_lines.length - 1; i++) {
        csv_line_breaks.push(csv_lines[i].split('\r').length - 1);
      }
      let csv_line_breaks_unique = csv_line_breaks.filter(function (item, pos) {
        return csv_line_breaks.indexOf(item) == pos;
      });
      if (csv_line_breaks_unique.length > 1) {
        console.log('Line breaks are not the same throughout the csv file.');
      }
    };

    // Undeclared header: if you do not specify in a machine readable way whether or not your CSV has a header row
    const undeclaredHeader = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_headers = csv_lines[0].split(',');
      if (csv_headers.length == 1) {
        console.log('The csv headers have not been declared.', `the headers are: ${headers}`);
      }
    };

    // Ragged rows: if every row in the file doesn't have the same number of columns
    const raggedRows = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_headers = csv_lines[0].split(',');
      let csv_rows = []
      // console.log(csv_rows)
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csv_rows.push(csv_lines[i].split(','));
      }
      let csv_rows_columns = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        csv_rows_columns.push(csv_rows[i].length);
      }
      let csv_rows_columns_unique = csv_rows_columns.filter(function (item, pos) {
        return csv_rows_columns.indexOf(item) == pos;
      });
      if (csv_rows_columns_unique.length > 1) {
        // console.log(csv_rows_columns_unique[0])
        // console.log(csv_rows_columns_unique)
        // const displayColumns = num => csv_rows_columns[csv_rows_columns_unique[num]]
        console.log(
          "Every row in the file doesn't have the same number of columns.",
          `here are the column counts we have found: ${[...csv_rows_columns_unique]}`
        );
      }
    };

    // Blank rows: if there are any blank rows
    const blankRows = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_rows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csv_rows.push(csv_lines[i].split(','));
      }
      let csv_rows_blank = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        if (csv_rows[i].length == 1 && csv_rows[i][0] == '') {
          csv_rows_blank.push(i);
        }
      }
      if (csv_rows_blank.length > 0) {
        console.log('There are blank rows in the csv.', `see here: ${csv_rows_blank} / ${csv_rows.length - 1}`);
      }
    };
    // Stray/Unclosed quote: if there are any unclosed quotes in the file
    //  const unclosedQuote = (csv) => {
    //   let csv_lines = csv.split('\n');
    //   let csv_rows = [];
    //   for (let i = 1; i < csv_lines.length-1; i++) {
    //     csv_rows.push(csv_lines[i].split(','));
    //   }
    //   let csv_rows_unclosed_quotes = [];
    //   for (let i = 0; i < csv_rows.length-1; i++) {
    //     for (let j = 0; j < csv_rows[i].length; j++) {
    //       if (csv_rows[i][j].split('"').length % 2 != 0) {
    //         csv_rows_unclosed_quotes.push(i);
    //       }
    //     }
    //   }
    //   if (csv_rows_unclosed_quotes.length > 0) {
    //     console.log('There are unclosed quotes in the csv file.', `see here: ${csv_rows_unclosed_quotes}`);
    //   }
    // };
    // or could check whole file, start to finish
    //   function checkQuotesInCSV(str) {
    //   var arr = str.split(',');
    //   for (var i = 0; i < arr.length; i++) {
    //     if (arr[i].indexOf('"') !== -1) {
    //       if (arr[i].indexOf('"') === 0) {
    //         if (arr[i].lastIndexOf('"') === arr[i].length - 1) {
    //           return true;
    //         } else {
    //           return false;
    //         }
    //       } else {
    //         return false;
    //       }
    //     } else {
    //       return true;
    //     }
    //   }
    // }


    // Whitespace: if there is any whitespace between commas and double quotes around fields
    const whiteSpace = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_rows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csv_rows.push(csv_lines[i].split(','));
      }
      let csv_rows_whitespace = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        for (let j = 0; j < csv_rows[i].length; j++) {
          if (csv_rows[i][j].split('"').length % 2 != 0) {
            if (csv_rows[i][j].split('"').length > 2) {
              if (csv_rows[i][j].split('"')[1].split(' ').length > 1) {
                csv_rows_whitespace.push(i);
              }
            }
          }
        }
      }
      if (csv_rows_whitespace.length > 0) {
        console.log(
          'There is whitespace between commas and double quotes around fields in csv.',
          `whitespace: ${csv_rows_whitespace}`
        );
      }
    };

    // If we get the CSV from a URL, then we also check for these errors:
    // Not found: if the file doesn't exist (we get a 404 Not Found response)
    let file = '';
    let file_exists = false;
    let file_lines = file.split('\n');
    if (file_lines.length > 0) {
      file_exists = true;
    }
    if (!file_exists) {
      console.log('404 error');
    }
    // Wrong content type: if the content type isn't set text/csv
    // Common Warnings
    // We also return the following warnings:
    // Encoding: if you don't use UTF-8 as the encoding for the file

    const checkUTF8 = (csv) => {
      let utf8Text = csv;
      try {
        // Try to convert to utf-8
        utf8Text = decodeURIComponent(escape(csv));
        // If the conversion succeeds, text is not utf-8
      } catch (e) {
        // console.log(e.message); // URI malformed
        // This exception means text is utf-8
      }
      return utf8Text; // returned text is always utf-8
    };
    // Check options: if the CSV file only contains a single comma-separated column; this usually means you're using a separator other than a comm
    const singleCommaSeparated = csv => {
      let csv_lines = csv.split('\n');
      let csv_rows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csv_rows.push(csv_lines[i].split(','));
      }
      let csv_rows_columns = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        csv_rows_columns.push(csv_rows[i].length);
      }
      let csv_rows_columns_unique = csv_rows_columns.filter(function (item, pos) {
        return csv_rows_columns.indexOf(item) == pos;
      });
      if (csv_rows_columns_unique.length == 1 && csv_rows_columns_unique[0] == 1) {
        console.log(
          'The CSV file only contains a single comma-separated column.',
        );
      }
    }
    // Inconsistent values: if any column contains inconsistent values, for example if most values in a column are numeric but there's a significant proportion that aren't
    const find = (csv) => {
      var lineBreaks = csv.match(/\n/g);
      console.log(lineBreaks);
    }
    const inconsistentValues = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_rows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csv_rows.push(csv_lines[i].split(','));
      }
      let csv_rows_columns = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        csv_rows_columns.push(csv_rows[i].length);
      }
      let csv_rows_columns_unique = csv_rows_columns.filter(function (item, pos) {
        return csv_rows_columns.indexOf(item) == pos;
      });
      let csv_rows_columns_unique_max = Math.max.apply(
        Math,
        csv_rows_columns_unique
      );
      let csv_rows_columns_unique_max_index = csv_rows_columns_unique.indexOf(
        csv_rows_columns_unique_max
      );
      let csv_rows_columns_unique_max_columns =
        csv_rows_columns_unique[csv_rows_columns_unique_max_index];
      let csv_rows_columns_unique_max_columns_values = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        csv_rows_columns_unique_max_columns_values.push(
          csv_rows[i][csv_rows_columns_unique_max_columns]
        );
      }
      let csv_rows_columns_unique_max_columns_values_numeric = [];
      for (let i = 0; i < csv_rows_columns_unique_max_columns_values.length; i++) {
        if (!isNaN(csv_rows_columns_unique_max_columns_values[i])) {
          csv_rows_columns_unique_max_columns_values_numeric.push(
            csv_rows_columns_unique_max_columns_values[i]
          );
        }
      }
      if (
        csv_rows_columns_unique_max_columns_values_numeric.length /
        csv_rows_columns_unique_max_columns_values.length <
        0.9
      ) {
        console.log('There are inconsistent values in the csv file.');
      }
    };

    // Empty column name: if all the columns don't have a name
    const emptyColumnName = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_headers = csv_lines[0].split(',');
      let csv_headers_blank = [];
      for (let i = 0; i < csv_headers.length; i++) {
        if (csv_headers[i] == '') {
          csv_headers_blank.push(i);
        }
      }
      if (csv_headers_blank.length > 0) {
        console.log("There are columns that don't have a name in the csv file.");
      }
    };
    // Duplicate column name: if all the column names aren't unique
    const duplicateColumnName = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_headers = csv_lines[0].split(',');
      let csv_headers_unique = csv_headers.filter(function (item, pos) {
        return csv_headers.indexOf(item) == pos;
      });
      if (csv_headers_unique.length != csv_headers.length) {
        console.log('Not all the columns are unique.', `see here: ${csv_headers_unique}`);
      }
    };

    // find(result.contents)
    lineBreaks(result.contents)
    undeclaredHeader(result.contents)
    raggedRows(result.contents)
    singleCommaSeparated(result.contents)
    blankRows(result.contents)
    // unclosedQuote(result.contents)
    whiteSpace(result.contents)
    checkUTF8(result.contents)
    inconsistentValues(result.contents)
    emptyColumnName(result.contents)
    duplicateColumnName(result.contents)
  }
  // async runSchema(input){
  //   const schema = {
  //     properties: {
  //       OrderID: {type: "string"},
  //       Booker: {type: "string"},
  //       Value: {type: "float32"},
  //       Rating: {type: "int32"}
  //     },
  //     additionalProperties: true
  //   };

  //   const serialize = ajv.compileSerializer(schema);
  //   return serialize
  // }



  async validate(input) {
    function convertIntObj(input) {
      const res = {}
      for (const key in input) {
        res[key] = {};
        for (const prop in input[key]) {
          const parsed = parseInt(input[key][prop], 10);
          res[key][prop] = isNaN(parsed) ? input[key][prop] : parsed;
        }
      }
      return res;
    }

    var result = convertIntObj(input);
    var arrayResult = Object.values(result);
    const ajv = new Ajv({ strict: false });


    // console.log(input[0])

 let schema = this.model.get('_schema')
    let results = []
    // var testSchemaValidator = ajv.compile(schema);
    for (let i = 0; i < arrayResult.length; i++) {
      // console.log(arrayResult[i])
      var valid = ajv.validate(schema, arrayResult[i]);
      // console.log(valid)
      // // let valid = ajv.validate(schema, input[0]);
      // console.log('logging if valid:', valid)
      // console.log(ajv.errors)

      if (!valid) {
        results.push(ajv.errors)
      }
      // let colName =  ajv.errors['instancePath'].slice(1,);
      // let colType = ajv.errors['keyword'];
      // let problem = ajv.errors['message'];
      // console.log(colName, colType, problem)
      // if (colType === "type") {
      //   console.log(`"${colName}" ${colType} ${problem}.`)
      // } else if (validate.errors[0]["params"]["error"] === "missing") {
      //   let missingCol = validate.errors[0]["params"]["missingProperty"];
      //   console.log(`Cannot find required property "${missingCol}".`)
      // }
    }
    console.log('hi')
    if (results === []){
      return $('#feedback').html('ajv found no errors')
    }
    else if (validate.errors[0]["params"]["error"] === "missing"){
      let missingCol = validate.errors[0]["params"]["missingProperty"];
        console.log(`Cannot find required property "${missingCol}".`)
    }
    else{
    $('#feedback').html(`the <strong> ${results[0][0]['instancePath'].slice(1,).toLowerCase()} </strong> an${results[0][0]['message']}`)
    }
  }

  // async checkTest(){
  //   let userResults = []
  //   let points = 0
  //   let result = await this.getFile()
  //   function checkRows(input, x) {
  //     let numRows = input.length;
  //     if (numRows == x) {
  //       console.log(true)
  //       userResults.push({'row':`✅  There are ${x} rows in the dataset. One point awarded.`});
  //       points += 1
  //     }
  //     else if (numRows !== x) {
  //       userResults.push({'row':`✏️  There are not ${x} rows in the dataset. No points awarded`});
  //     }
  //   }
  //   checkRows(Object.keys(result.parse.data[0]), 7)

  //   const item = this.model.get('_items')[0];
  //   item._score = points;

  //   console.log(item)
  //   let resultObj = {
  //     userResults: userResults,
  //     points  : points
  //   }
  //   return resultObj
  // }

  //  async feedback(){
  //   let userResult = await this.checkTest()
  //   let arrResults
  //   for (let i of userResult.userResults) {
  //     arrResults = `${Object.values(i)}`
  //   }

  //   this.model.get('_items')[0].feedback = arrResults
  //   this.model.get('_feedback').correct = arrResults
  //   this.model.get('_feedback')._incorrect.final = arrResults
  //   this.model.get('_feedback')._partlyCorrect.final = arrResults
  //  return $('#feedback').text(arrResults)

  //  }
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

    let result = await this.getFile()
    // console.log(result.parse.data)
    this.checkCsvStructure()
    //  let userResult = await this.checkTest()
    this.validate(result.parse.data)
    // this.feedback()
    const $input = $(e.target)
    this.createTable(result.parse.data)

    // this.model.setItemUserAnswer($input.parents('.js-item-input').index(), userResult);
  }
}

