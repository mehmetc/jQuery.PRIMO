<%@ page language="java" contentType="application/json; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="org.json.simple.JSONObject"%>
<%@ page import="org.json.simple.parser.JSONParser"%>
<%@ page import="net.sf.json.xml.XMLSerializer"%>
<%@ page import="com.exlibris.primo.context.ContextAccess"%>
<%@ page import="com.exlibris.primo.domain.delivery.Institution"%>
<%@ page import="com.exlibris.primo.domain.delivery.InstitutionIP"%>
<%@ page import="com.exlibris.primo.domain.reference.HMappingTables"%>
<%@ page import="com.exlibris.primo.domain.views.Views"%>
<%@ page import="com.exlibris.primo.facade.CodeTablesManagementFacade"%>
<%@ page import="com.exlibris.primo.facade.InstitutionsManagementFacade"%>
<%@ page import="com.exlibris.primo.pds.PdsUserInfo"%>
<%@ page import="com.exlibris.primo.server.facade.ViewsManagementFacade"%>
<%@ page import="com.exlibris.primo.utils.SessionUtils"%>
<%@ page import="com.exlibris.primo.utils.UserContext"%>

<%@ page import="java.net.InetAddress"%>
<%@ page import="java.util.ArrayList"%>
<%@ page import="java.util.List"%>
<%@ page import="java.io.*" %>
<%@ page import="java.net.*" %>

<%
/*
    This file is part of jQuery.PRIMO
    It will get useful session information.
*/

JSONObject obj=new JSONObject();

try{
//GENERAL
    obj.put("sessionId", SessionUtils.getSessionId(request));

//PDS
    String pdsHandle = SessionUtils.getPdsHandle(request);
    JSONObject pdsObj = new JSONObject();
    pdsObj.put("url", SessionUtils.getPDSUrl(request));

    if (pdsHandle != null && pdsHandle != ""){
        pdsObj.put("handle", pdsHandle);

        try{
/* ****************************************************************************
        Set borInfoRawUrl to the PDS borrower URL
        URL should look like https://[my Primo instance]/pds?func=bor-info
***************************************************************************** */
                String borInfoRawUrl = "";

                if (borInfoRawUrl.length() > 0){
                        String borInfo = "";
                        String pdsBorInfoRawURL = borInfoRawUrl + "&pds_handle=" + pdsHandle;

                        pdsObj.put("borInfoURL", pdsBorInfoRawURL);
                        URL pdsBorInfoUrl = new URL(pdsBorInfoRawURL);

                        try{
                                URLConnection urlCon = pdsBorInfoUrl.openConnection();
                                borInfo=new XMLSerializer().readFromStream(urlCon.getInputStream()).toString(2);
                                JSONParser parser=new JSONParser();
                                JSONObject pds = (JSONObject)parser.parse(borInfo);
                                pdsObj.put("borInfo", pds.get("bor-info"));
                        } catch(Exception e){
                                pdsObj.put("borInfo", "");
                                pdsObj.put("borInfoRaw", borInfo);
                        }
                }
        }
        catch(Exception e) {
                pdsObj.put("borInfo", "");
        }
    }
    obj.put("pds", pdsObj);
//USER
    PdsUserInfo userInfo = SessionUtils.getUserInfo(request);
    JSONObject userObj = new JSONObject();

    if (userInfo != null) {
            userObj.put("id", userInfo.getUserId());
            userObj.put("name", userInfo.getUserName());
            userObj.put("email", userInfo.getEmail());
            userObj.put("isOnCampus",Boolean.valueOf(UserContext.isOnCampus(request)).booleanValue());
            userObj.put("isLoggedIn",SessionUtils.getIsLoggedIn(request));

            JSONObject rankingObj = new JSONObject();
            try {
              rankingObj.put("categories", SessionUtils.getPyrCategories(request));
              rankingObj.put("prefer_new", SessionUtils.getPyrRecentness(request));

              userObj.put("ranking", rankingObj);
            } catch(Exception e){
              userObj.put("ranking", "");
            }
    }

    obj.put("user", userObj);

//VIEW
    String viewId = SessionUtils.getSessionViewId(request);
    JSONObject viewObj = new JSONObject();
    viewObj.put("code", viewId);

    JSONObject viewInstitutionObj = new JSONObject();
    ViewsManagementFacade viewFacade = (ViewsManagementFacade) ContextAccess.getInstance().getBean("viewsManagementFacade");
    try{
        List<Views> viewList = viewFacade.findViewByViewCode(viewId);
        Views view = viewList.get(0);

        Institution institution = view.getInstitutions();
        viewInstitutionObj.put("name", institution.getInstitutionName());
        viewInstitutionObj.put("code", institution.getInstitutionCode());
    } catch(Exception e){
      viewInstitutionObj.put("name", "");
      viewInstitutionObj.put("code", "");
    }

    viewObj.put("institution", viewInstitutionObj);
    viewObj.put("interfaceLanguage", SessionUtils.getChosenInterfaceLanguage(request));
    obj.put("view", viewObj);

//IP
    JSONObject ipObj = new JSONObject();
    JSONObject ipInstitutionObj = new JSONObject();
    InetAddress ipAddress = InetAddress.getByName(request.getRemoteAddr());
    ipObj.put("address", ipAddress.getHostAddress());

    InstitutionsManagementFacade institutionFacade = (InstitutionsManagementFacade) ContextAccess.getInstance().getBean("institutionsManagementFacade");
    try {
            InstitutionIP institutionByIP = institutionFacade.findInstitution(ipAddress);

            Institution institution = institutionByIP.getInstitution();

            if (institution != null){
                ipInstitutionObj.put("name", institution.getInstitutionName());
                ipInstitutionObj.put("code", institution.getInstitutionCode());
            }
     }catch(Exception e) {
        ipInstitutionObj.put("name", "");
        ipInstitutionObj.put("code", "");
     }

    ipObj.put("institution", ipInstitutionObj);

    obj.put("ip", ipObj);

} catch(Exception e){
  e.printStackTrace();
  obj.put("error", e.getMessage());
}
%>

<%= obj %>