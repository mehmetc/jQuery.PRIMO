<%@ page language="java" contentType="application/json; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="org.json.simple.JSONObject"%>
<%@ page import="org.json.simple.JSONArray"%>
<%@ page import="com.exlibris.primo.context.ContextAccess"%>
<%@ page import="com.exlibris.primo.domain.entities.HSourceRecord"%>
<%@ page import="java.util.ArrayList"%>
<%@ page import="java.util.List"%>
<%
/*

    This file is part of jQuery.PRIMO
    It will lookup all records contained in a deduped record.

*/
JSONArray obj = new JSONArray();
try {
    String dedupID = request.getParameter("id");

    if ((dedupID != null) && (dedupID.length() > 0)) {

        List<String> dedupList = new ArrayList();

        List resultList = new ArrayList();
        long recordID = Long.parseLong(dedupID.replaceAll("dedupmrg", ""));

        resultList = ContextAccess.getInstance().getPersistenceManager().find("from HSourceRecord record where record.matchId = ?", new Object[]{recordID});

        if (resultList.size() > 0) {
            for (Object record: resultList){
                if (!dedupList.contains(((HSourceRecord)record).getSourceId())) {
                    dedupList.add(((HSourceRecord)record).getSourceId());
                }
            }
        }

        obj.addAll(dedupList);
    }
 } catch (Exception e) {
  e.printStackTrace();
  //obj.put("error", e.getMessage());
  obj.add(e.getMessage());
 }
%>

<%= obj %>