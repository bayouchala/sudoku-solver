'use strict';

//const { json } = require('body-parser');
const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const {puzzle, coordinate, value} = req.body;
      if(!puzzle || !coordinate || !value){
        res.json({ error: "Required field(s) missing" });
        return;
      }
      if(solver.validate(puzzle) !== "valid"){
        res.json({ error: solver.validate(puzzle) });
        return;
      }
      const row = coordinate.split("")[0];
      const column = coordinate.split("")[1];
      if(
        coordinate.length !== 2 ||
        !/[a-i]/i.test(row) ||
        !/[1-9]/i.test(column)
      ){
        res.json({ error: "Invalid coordinate" });
        return;
      }
      if(!/^[1-9]$/.test(value)){
        res.json({ error: "Invalid value" });
        return;
      }
      let index = (solver.letterToNumber(row) - 1) * 9 + (+column - 1);
      if(puzzle[index] == value){
        res.json({ valid: true });
        return;
      }
      let validCol = solver.checkColPlacement(puzzle, row, column, value);
      let validReg = solver.checkRegionPlacement(puzzle, row, column, value);
      let validRow = solver.checkRowPlacement(puzzle, row, column, value);
      let confilicts = [];
      if (validCol && validReg && validRow){
        res.json({ valid: true });
      } else{
        if(!validRow){
          confilicts.push("row");
        }
        if(!validCol){
          confilicts.push("column");
        }
        if(!validReg){
          confilicts.push("region");
        }
        res.json({ valid: false, conflict: confilicts });
      }
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const puzzle = req.body.puzzle;
      if(solver.validate(puzzle) !== "valid"){
        res.json({ error: solver.validate(puzzle) });
        return;
      }
      const solveString = solver.completeSudoku(puzzle);
      if(!solveString){
        res.json({ error: "Puzzle cannot be solved" });
      }else{
        res.json({ solution: solveString });
      }
      return res.json({ solveString });
  });
};
