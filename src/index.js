import React, { useState, useEffect } from "react";
import { MdFileDownload } from "react-icons/md";
import Paginator from "react-js-paginator";
import SearchBar from "react-js-search";
import PropTypes from "prop-types";
import ReactHtmlParser from "react-html-parser";
import { saveAs } from "file-saver";

import "./style.css";

const TableCsvViewer = ({
  content,
  headers,
  minHeight,
  maxHeight,
  activateDownloadButton,
  headerCss,
  titleStyle,
  bodyCss,
  filename,
  renderLineNumber,
  reverseLineNumber,
  pagination,
  pageBoxStyle,
  activePageBoxStyle,
  maxPagesToDisplay,
  downloadButtonStyle,
  sortColumn,
  encoding,
  successColor,
  warningColor,
  errorColor,
  downloadName,
  title,
  tableStyle,
  topPagination,
  searchEnabled,
  placeholderSearchText,
  caseInsensitive,
  delimiter
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState(null);

  const compare = criteria => (a, b) => {
    if (a[criteria] < b[criteria]) {
      return -1;
    }
    if (a[criteria] > b[criteria]) {
      return 1;
    }
    return 0;
  };

  const sortTable = () => {
    if (sortColumn) {
      content.sort(compare(sortColumn));
    }
  };

  useEffect(() => {
    if (content.length && sortColumn) {
      sortTable();
    }
  }, [content, sortColumn]);

  const highlightSyntax = json => {
    if (json) {
      const newJson = json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return newJson.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        match => {
          let cls = "hljs-number";
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "hljs-key";
            } else {
              cls = "hljs-string";
            }
          } else if (/true|false/.test(match)) {
            cls = "hljs-boolean";
          } else if (/null/.test(match)) {
            cls = "hljs-null";
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
    }
    return "";
  };

  const generateAndDownloadCSV = () => {
    const encodingType = encoding || "UTF-8";
    const csvType = { encodingType, type: `text/plain;charset=${encoding}` };
    const newFilename = filename || "logResults.csv";
    let csvContent = "";
    let headersTemp = [];
    content.forEach(rowObj => {
      const rowObjKeys = Object.keys(rowObj);
      if (headers === undefined || headers.length === 0) {
        rowObjKeys.forEach(key => {
          headersTemp.push(key);
        });
      } else {
        headersTemp = [...headers];
      }
      const rowData = [];
      headersTemp.forEach(key => {
        let data = rowObj[key];
        if (data && typeof data === "string" && data.includes(",")) {
          data = `"${data.replace(/"/g, '""')}"`;
        }
        rowData.push(data);
      });
      const row = rowData.join(delimiter);
      csvContent += `${row}\r\n`;
    });
    const row = headersTemp.join(delimiter);
    csvContent = `${row}\r\n${csvContent}`;
    const blob = new Blob([csvContent], csvType);
    saveAs(blob, newFilename);
  };

  const renderDownload = () => {
    if (activateDownloadButton) {
      const buttonStyle = downloadButtonStyle || {};
      const csvFileName = filename || "logResults.csv";
      return (
        <div className="csvFileDownloader">
          <button
            type="button"
            style={buttonStyle}
            download={csvFileName}
            onClick={generateAndDownloadCSV}
          >
            <MdFileDownload />
            {downloadName || "Download Table Data"}
          </button>
        </div>
      );
    }

    return null;
  };

  const renderTitle = () => {
    if (Array.isArray(content) && content.length > 0) {
      return (
        <h2 className="tableTitle" style={titleStyle || {}}>
          {title}
        </h2>
      );
    }

    return null;
  };

  const pageChange = page => {
    setCurrentPage(page);
  };

  const onSearch = (term, elements) => {
    if (term.length > 0) {
      setSearchResults(elements);
    } else {
      setSearchResults(null);
    }
    pageChange(1);
  };

  const renderSearch = () => {
    if (searchEnabled) {
      let search = "Search...";
      if (placeholderSearchText) {
        search = placeholderSearchText;
      }

      return (
        <SearchBar
          onSearchTextChange={(b, e) => {
            onSearch(b, e);
          }}
          onSearchButtonClick={(b, e) => {
            onSearch(b, e);
          }}
          placeHolderText={search}
          data={content}
          caseInsensitive={!!caseInsensitive}
        />
      );
    }

    return null;
  };

  const renderPagination = (isTop = false) => {
    if (pagination || isTop) {
      const boxStyle = pageBoxStyle || {};
      const activeStyle = activePageBoxStyle || {};
      const pagesDisplay = maxPagesToDisplay || 5;
      if (content.length <= pagination) {
        return null;
      }

      let totalElements = content.length;
      if (searchResults) {
        totalElements = searchResults.length;
      }
      return (
        <Paginator
          pageSize={pagination}
          totalElements={totalElements}
          onPageChangeCallback={e => {
            pageChange(e);
          }}
          pageBoxStyle={boxStyle}
          activePageBoxStyle={activeStyle}
          maxPagesToDisplay={pagesDisplay}
        />
      );
    }

    return null;
  };

  const renderTopPagination = () => {
    if (topPagination) {
      return renderPagination(true);
    }
    return null;
  };

  const renderLineNumberFunc = i => (
    <div key={`table_row_number_${i}`} className="divTableCell">
      {i}
    </div>
  );

  const renderNumberHeader = () => {
    if (renderLineNumber) {
      return (
        <div key="table_header_line" className="divTableCell" style={headerCss}>
          Line
        </div>
      );
    }

    return null;
  };

  const renderRow = (row, i) => {
    if (row) {
      const rowData = [];
      // Render line number
      if (renderLineNumber) {
        let number = i + 1;
        if (reverseLineNumber) {
          number = content.length - i;
        }
        rowData.push(renderLineNumberFunc(number));
      }

      // Create content
      const rowContent = headers.map(header => {
        let headerContent = row[header];
        let isJson = false;

        try {
          if (typeof headerContent !== "number") {
            headerContent = JSON.parse(headerContent);
            isJson = true;
          }
        } catch (e) {
          headerContent = row[header];
          if (headerContent) {
            headerContent = headerContent
              .split("\n")
              .map(item => <p key={`part-${item}`}>{item}</p>);
          }

          isJson = false;
        }
        if (isJson) {
          const jsonText = JSON.stringify(headerContent, undefined, 2);
          const highlight = highlightSyntax(jsonText);
          const parsedHtml = ReactHtmlParser(highlight, true);
          return (
            <div key={`table_row_${header}`} className="divTableCell">
              <pre>{parsedHtml}</pre>
            </div>
          );
        }

        return (
          <div key={`table_row_${header}`} className="divTableCell">
            {headerContent}
          </div>
        );
      });

      return [...rowData, ...rowContent];
    }

    return null;
  };

  const getRow = (row, i) => {
    const isWarning = row.warning || false;
    const isSucccess = row.success;
    let fontColor = "#000000";

    if (isSucccess === false) {
      fontColor = errorColor || "#b30009";
    } else if (isWarning) {
      fontColor = warningColor || "#ba8722";
    } else if (isSucccess === true) {
      fontColor = successColor || "#0b7012";
    }

    return (
      <div
        key={`table_row_${i} `}
        className="divTableRow"
        style={{ ...bodyCss, ...{ color: fontColor } }}
      >
        {renderRow(row, i)}
      </div>
    );
  };

  const renderAllRows = rows => rows.map((row, i) => getRow(row, i));

  const renderRowPage = rows => {
    const rowsContent = [];
    const pageStart = (currentPage - 1) * pagination;

    for (let i = pageStart; i < pageStart + pagination && rows[i]; i += 1) {
      rowsContent.push(getRow(rows[i], i));
    }

    return rowsContent;
  };

  const renderBody = () => {
    const rows = searchResults || content;
    if (rows !== null) {
      if (pagination) {
        return renderRowPage(rows);
      }
      return renderAllRows(rows);
    }

    return null;
  };

  const renderHeaders = () => {
    if (headers) {
      return (
        <div className="divTableRow">
          {renderNumberHeader(headerCss)}
          {headers.map(header => (
            <div
              key={`table_header_${header}`}
              className="divTableCell"
              style={headerCss}
            >
              {header}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const height = { maxHeight, minHeight, ...tableStyle };

  return (
    <div className="tableWithCSV">
      {renderTitle()}
      <div className="titleContainer">
        {renderDownload()}
        {renderTopPagination()}
        <div className="search-container">{renderSearch()}</div>
      </div>

      <div className="divTableContainer">
        <div className="divTable" style={height}>
          <div className="divTableHeading">{renderHeaders()}</div>
          <div className="divTableBody">{renderBody()}</div>
        </div>
      </div>
      {renderPagination()}
    </div>
  );
};

TableCsvViewer.propTypes = {
  content: PropTypes.instanceOf(Array).isRequired,
  headers: PropTypes.instanceOf(Array).isRequired,
  minHeight: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  activateDownloadButton: PropTypes.bool,
  headerCss: PropTypes.shape({}),
  titleStyle: PropTypes.shape({}),
  bodyCss: PropTypes.shape({}),
  filename: PropTypes.string,
  renderLineNumber: PropTypes.bool,
  reverseLineNumber: PropTypes.bool,
  pagination: PropTypes.number,
  pageBoxStyle: PropTypes.shape({}),
  activePageBoxStyle: PropTypes.shape({}),
  maxPagesToDisplay: PropTypes.number,
  downloadButtonStyle: PropTypes.shape({}),
  sortColumn: PropTypes.string,
  encoding: PropTypes.string,
  successColor: PropTypes.string,
  warningColor: PropTypes.string,
  errorColor: PropTypes.string,
  downloadName: PropTypes.string,
  title: PropTypes.string,
  placeholderSearchText: PropTypes.string,
  tableStyle: PropTypes.shape({}),
  topPagination: PropTypes.bool,
  searchEnabled: PropTypes.bool,
  caseInsensitive: PropTypes.bool,
  delimiter: PropTypes.string
};

TableCsvViewer.defaultProps = {
  activateDownloadButton: false,
  headerCss: {},
  titleStyle: {},
  bodyCss: {},
  filename: "",
  renderLineNumber: false,
  reverseLineNumber: false,
  pagination: 5,
  pageBoxStyle: {},
  activePageBoxStyle: {},
  maxPagesToDisplay: 100,
  downloadButtonStyle: {},
  sortColumn: "",
  encoding: "",
  successColor: "",
  warningColor: "",
  errorColor: "",
  downloadName: "",
  title: "",
  placeholderSearchText: "",
  tableStyle: {},
  topPagination: false,
  searchEnabled: false,
  caseInsensitive: false,
  delimiter: ","
};

export default TableCsvViewer;
