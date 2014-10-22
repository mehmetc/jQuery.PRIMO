<%@ page trimDirectiveWhitespaces="true"%>
<%@ page language="java" contentType="text/xml; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.exlibris.primo.utils.SessionUtils" %>
<%@ page import="com.exlibris.jaguar.xsd.search.DOCDocument.DOC" %>
<%@ page import="com.exlibris.primo.context.ContextAccess" %>
<%@ page import="com.exlibris.primo.domain.entities.OriginalSourceRecord" %>
<%@ page import="java.util.ArrayList"%>
<%@ page import="java.util.List" %>

<%
// if you want this to work you need to
// uncomment  <mapping resource="com/exlibris/primo/domain/entities/OriginalSourceRecord.hbm.xml"/>
// from the hibernate mapping file /exlibris/primo/p4_1/ng/primo/home/system/search/conf/hibernate.cfg.xml
// and you need to reapply after every Primo upgrade.
//
// usage: showXML.jsp?id=0
// id is the record index not the record id must change this.
String record = "<error>no record</error>";
int recordID = Integer.parseInt(request.getParameter("id"));
try {
        DOC[] docArray = SessionUtils.getSearchResult(request).getSEGMENTS().getJAGROOTArray(0).getRESULT().getDOCSET().getDOCArray();
        if ( recordID >=0 && recordID < docArray.length) {
           String sourceRecordID = null;
           sourceRecordID = docArray[recordID].getPrimoNMBib().getRecordArray()[0].getControl().getRecordidArray(0);
           if ((sourceRecordID != null) && (sourceRecordID.length() > 0)) {
                if (sourceRecordID.startsWith("TN_")){
                   record = docArray[recordID].getPrimoNMBib().xmlText();
                } else {
                   record = ((OriginalSourceRecord)ContextAccess.getInstance().getPersistenceManager().find("from OriginalSourceRecord record where record.recordID = ?", new Object[]{sourceRecordID}).get(0)).getSourceRecord();
                }
          } else {
                record = "<error>Couldn't extract source record id</error>";
          }
        }

} catch (Exception e) {
   record = "<error>" + e.getMessage() + "</error>";
}
%>

<%=record%>