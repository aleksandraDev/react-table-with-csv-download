import React, { Component } from "react";
import { Scrollbars } from "react-custom-scrollbars";

import "./logViewer.css";
import MdFileDownload from "react-icons/lib/md/file-download";
import Paginator from 'react-js-paginator';
import FileSaver from 'file-saver/FileSaver';

import PropTypes from 'prop-types';

/**
 * TableViewer component
 * @author [Jose Antonio Ciccio](https://github.com/jciccio)
 */
class TableViewer extends Component {
  constructor(props) {
    super(props);
    this.generateAndDownloadCSV = this.generateAndDownloadCSV.bind(this);
    this.state = {
      currentPage: 1
    };
  }

  generateAndDownloadCSV() {
    let csvType = {type: "data:text/csv;charset=utf-8" };
    let filename = this.props.filename? this.props.filename : "logResults.csv";
    var csvContent = "";
    var data = this.props.content;
    var headers = [];
    this.props.content.forEach(function(rowObj) {
      if (headers === undefined || headers.length === 0) {
        for (let property in rowObj) {
          if (rowObj.hasOwnProperty(property)) {
            headers.push(property);
          }
        }
        let row = headers.join(",");
        csvContent += row + "\r\n";
      }
      var rowData = [];
      for (var i in headers) {
        let data = rowObj[headers[i]];
        if (data && typeof data == "string" && data.indexOf(",") >= 0 ){
          data = `"${data}"`;
        }
        rowData.push(data);
      }
      let row = rowData.join(",");
      csvContent += row + "\r\n";
    });
    var blob = new Blob([csvContent], csvType);
    FileSaver.saveAs(blob, filename);
  }

  /*static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.csvText !== prevState.csvText) {
      let Papa = require("papaparse/papaparse.min.js");
      let data = Papa.parse(nextProps.csvText);
      return { 
        csv: data,
        csvText: nextProps.csvText
      }
    }  
    return null;
  }

  shouldComponentUpdate(nextProps, nextState){
    return (this.state.csvText !== nextState.csvText);
  }*/

  renderDownload() {
    if (this.props.activateDownloadButton) {
      let buttonStyle = this.props.downloadButtonStyle ? this.props.downloadButtonStyle : {};
      return (
        <div className="csvFileDownloader">
          <button style={buttonStyle}
            download={this.props.csvFileName}
            onClick={this.generateAndDownloadCSV}
          >
            <MdFileDownload size={30} color="green" /> {this.props.downloadName ? this.props.downloadName : "Download Table Data"}
          </button>
        </div>
      );
    } 
    else {
      return null;
    }
  }

  render() {
    var height = {maxHeight: this.props.maxHeight}
    return (
      <div className="logViewer">
        {this.renderStats()}
        {this.renderDownload()}
        <div className="divTable" style={height}>
          <div className="divTableHeading">{this.renderHeaders()}</div>
          <div className="divTableBody">{this.renderBody()}</div>
        </div>
        {this.renderPagination()}
      </div>
    );
  }

  renderPagination(){
    if (this.props.pagination){
      var boxStyle = this.props.pageBoxStyle ? this.props.pageBoxStyle: {};
      var activeStyle = this.props.activePageBoxStyle ? this.props.activePageBoxStyle: {}
      var pagesDisplay = this.props.maxPagesToDisplay ? this.props.maxPagesToDisplay : 5;
      return(
        <Paginator
          pageSize={this.props.pagination}
          totalElements={this.props.content.length}
          onPageChangeCallback={(e) => {this.pageChange(e)}}
          pageBoxStyle={boxStyle}
          activePageBoxStyle={activeStyle}
          maxPagesToDisplay={pagesDisplay}
        />
      );
    }
    else{
      return null;
    }
  }

  pageChange(page){
    this.setState({currentPage: page});
  }

  renderAllRows(){
    var rows = this.props.content;
    var headers  = this.props.headers;
    return rows.map((row, i) => {
      return this.getRow(row,i);
    });
  }

  renderRowPage(rows){
    let rowsContent = []
    let pageStart = (this.state.currentPage-1) * this.props.pagination;
    var rowQty = rows.length; 
    var headers  = this.props.headers;

    for(var i = pageStart; i < pageStart+this.props.pagination && rows[i]; i++){
      rowsContent.push(this.getRow(rows[i], i));
    }

    return rowsContent;
  }

  renderBody() {
    var rows = this.props.content;
    if (rows !== null){
      if(this.props.pagination){
        return this.renderRowPage(rows);
      }else{
        return this.renderAllRows(rows);
      }
    }
    else {
      return (null);
    }

  }

  getRow(row, i){
    return(
      <div 
        key={`table_row_${i} `} 
        className={`divTableRow logViewerSuccess_${row.success}`}
        style={this.props.bodyCss}
      >
        {this.renderRow(row,i)}
      </div>
    )
  }

  renderLineNumber(i){
    return (
      <div 
        key={`table_row_number_${i}`} 
        className="divTableCell">
        {i}
      </div>
    )
  }

  renderNumberHeader(headerCss){
    if(this.props.renderLineNumber){
      return (
        <div key={`table_header_line`} className="divTableCell" style={headerCss}>
          Line
        </div>
      );
    }
    else{
      return null;
    }
  }

  renderRow(row, i){
    var headers = this.props.headers;
    if (row){
      let rowData = [];
      if(this.props.renderLineNumber){
        let number = i+1;
        if (this.props.reverseLineNumber){
          number = this.props.content.length - i;
        }
        rowData.push(this.renderLineNumber(number));
      }
      let rowContent = headers.map((header, element) => {
        return (
          <div 
          key={`table_row_${i}_cell_${element}`} 
          className="divTableCell">
            {row[header]}
          </div>
        )
      });
      return [...rowData, ...rowContent];
    }
    else {
      return null;
    }
   /* 
    return headers.map(function(header, i) {
      return (
        <td className={`header`}>{row[header]}</td>
      );
    });*/
  }

  renderHeaders() {
    let headers = this.props.headers;
    var headerCss = this.props.headerCss;
    if (headers){
      return (
        <div className="divTableRow">
        {this.renderNumberHeader(headerCss)}
        {headers.map(function(header, index) {
          return (
            <div key={`table_header_${index}`} className="divTableCell" style={headerCss}>
              {header}
            </div>
          );
        })}
        </div>
      );
    }
    else {
      return null;
    }
  }

  renderStats(){
    if (this.props.renderStats){
      return (
        <div>
        <label>{this.props.title}</label>
        <br />
        <label className="logViewerSuccess_true">
          Success: {this.props.successRows}
        </ label>
        <br />
        <label className="logViewerSuccess_false">
          Error: {this.props.errorsRows}
        </ label>
        <br />
        <label>-----------------------------</label>
        <br />
        <label>Total: {this.props.totalRows}</label>
        <br />
        </div>
      );
    }
    else{
      return null;
    }
  }
}


export default TableViewer;
