<%@ page language="java" contentType="text/xml; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.exlibris.primo.utils.SessionUtils" %>
<%@ page import="com.exlibris.primo.utils.CommonUtil" %>
<%@ page import="com.exlibris.primo.context.ContextAccess" %>
<%@ page import="com.exlibris.primo.domain.entities.HRemoteSourceRecord" %>
<%@ page import="com.exlibris.primo.domain.entities.HSourceRecord" %>
<%@ page import="com.exlibris.primo.domain.entities.OriginalSourceRecord" %>
<%@ page import="com.exlibris.primo.facade.PnxManagementFacade" %>
<%@ page import="com.exlibris.jaguar.xsd.search.DOCDocument.DOC" %>
<%@ page import="org.apache.xmlbeans.XmlOptions" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.HashMap" %>

<%
/*
 This file is part of jQuery.PRIMO
 This script will return PNX but it can also return the original LOCAL record.
 if you want this to work you need to uncomment or add
          <mapping resource="com/exlibris/primo/domain/entities/OriginalSourceRecord.hbm.xml"/>
 to the hibernate mapping file /exlibris/primo/p4_1/ng/primo/home/system/search/conf/hibernate.cfg.xml
 The hibernate mapping file will be overwritten after each update this means you need to reapply this patch
 after every Primo upgrade.
*/
String   record     = "<error>no record</error>";

try {
    String data       = request.getParameter("id");
    String   returnType = "pnx"; //default returnType
    String   recordID   = "";
    String   rawReturnType = "";

// set recordID and returnType
    rawReturnType = data.substring(data.length() - 4);

    if (rawReturnType.equals(".xml")){
          recordID = data.replace(".xml", "");
          returnType = "xml";
    } else if (rawReturnType.equals(".pnx")){
          recordID = data.replace(".pnx", "");
          returnType = "pnx";
    } else {
          recordID = data;
    }

    if (returnType.equals("xml")) {
       if (CommonUtil.isNotLocalRecord(recordID)) {
           List resultList = new ArrayList();
           resultList = ContextAccess.getInstance().getPersistenceManager().find("from HRemoteSourceRecord record where record.recordId = ?", new Object[]{recordID});

           if (resultList.size() > 0) {
              record = ((HRemoteSourceRecord) resultList.get(0)).getXmlContent();
           } else {
              returnType = "pnx";  //Show PNX if record not found
          }
       } else {
           List resultList = new ArrayList();
           resultList = ContextAccess.getInstance().getPersistenceManager().find("from OriginalSourceRecord record where record.recordID = ?", new Object[]{recordID});

           if (resultList.size() > 0) {
               record = ((OriginalSourceRecord) resultList.get(0)).getSourceRecord();
           }
       }
    }


    if (returnType.equals("pnx")) {
        if (CommonUtil.isNotLocalRecord(recordID)) {
            //Get records from resultset
            HashMap<String,String> records = new HashMap<String,String>();

            DOC[] docArray = SessionUtils.getSearchResult(request).getSEGMENTS().getJAGROOTArray(0).getRESULT().getDOCSET().getDOCArray();
            for (DOC doc : docArray) {
                String id = doc.getPrimoNMBib().getRecordArray(0).getControl().getRecordidArray(0);
                records.put(id, doc.getPrimoNMBib().getRecordArray(0).xmlText( new XmlOptions().setSaveOuter() ));
            }

            //Pick requested record
            record = records.get(recordID);
        } else { // read from database if it is a local record
            record = ((HSourceRecord)ContextAccess.getInstance().getPersistenceManager().find("from HSourceRecord record where record.recordId = ?", new Object[]{recordID}).get(0)).getXmlContent();
        }
    }

    if (!record.startsWith("<?xml")) {
       record = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + record;
    };
} catch(Exception e) {
 record     =  "<error>unable to find record '" + e.getMessage() + "'</error>";
}
%>

<%=record%>