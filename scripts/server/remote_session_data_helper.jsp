<%@page contentType="application/json; charset=UTF-8"%>
<%@page import="org.json.simple.JSONObject"%>
<%@page import="com.exlibris.primo.context.ContextAccess"%>
<%@page import="com.exlibris.primo.domain.delivery.Institution"%>
<%@page import="com.exlibris.primo.domain.delivery.InstitutionIP"%>
<%@page import="com.exlibris.primo.domain.reference.HMappingTables"%>
<%@page import="com.exlibris.primo.domain.views.Views"%>
<%@page import="com.exlibris.primo.facade.CodeTablesManagementFacade"%>
<%@page import="com.exlibris.primo.facade.InstitutionsManagementFacade"%>
<%@page import="com.exlibris.primo.pds.PdsUserInfo"%>
<%@page import="com.exlibris.primo.server.facade.ViewsManagementFacade"%>
<%@page import="com.exlibris.primo.utils.SessionUtils"%>
<%@page import="java.net.InetAddress"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%
try{
    JSONObject obj=new JSONObject();
//GENERAL
    obj.put("sessionId", SessionUtils.getSessionId(request));
    obj.put("pdsUrl", SessionUtils.getPDSUrl(request));

//USER
    PdsUserInfo userInfo = SessionUtils.getUserInfo(request);
    JSONObject userObj = new JSONObject();

    if (userInfo != null) {
            userObj.put("id", userInfo.getUserId());
            userObj.put("name", userInfo.getUserName());
            userObj.put("email", userInfo.getEmail());
            userObj.put("isOnCampus",Boolean.valueOf(SessionUtils.getOnCampus(request)).booleanValue());
            userObj.put("isLoggedIn",SessionUtils.getIsLoggedIn(request));
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

//PRINT ALL
    out.print(obj);
    out.flush();
} catch(Exception e){
  out.println("{\"error\":\"");
  e.printStackTrace(new java.io.PrintWriter(out));
  out.println("\"}");
}
%>
