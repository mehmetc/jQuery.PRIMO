<?xml version="1.0" encoding="UTF-8"?>
<%@ page language="java" contentType="text/xml; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.exlibris.primo.utils.SessionUtils" %>
<%@ page import="com.exlibris.jaguar.xsd.search.DOCDocument.DOC" %>

<%
String record = "<error>no record</error>";
int recordID = Integer.parseInt(request.getParameter("id"));

try {
        DOC[] docArray = SessionUtils.getSearchResult(request).getSEGMENTS().getJAGROOTArray(0).getRESULT().getDOCSET().getDOCArray();

        if ( recordID >=0 && recordID < docArray.length) {
           record =docArray[recordID].getPrimoNMBib().xmlText();
        }
} catch (Exception e) {
   record = "<error>" + e.getMessage() + "</error>";
}
%>

<%=record%>