<%@page contentType="text/html"%>
<%@page trimDirectiveWhitespaces="true"%>
<%@page pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<%@include file="css.jsi" %>
<%=intl.title("config sidebar")%>
<style type='text/css'>input.default {width: 1px; height: 1px; visibility: hidden;}</style>
<%@include file="summaryajax.jsi" %>
</head>
<body>
<script nonce="<%=cspNonce%>" type="text/javascript">progressx.show();</script>
<%@include file="summary.jsi" %>
<h1 class="conf"><%=intl._t("Customize Sidebar")%></h1>
<div class="main" id="config_summarybar">
<%@include file="confignav.jsi" %>
<jsp:useBean class="net.i2p.router.web.helpers.ConfigSummaryHandler" id="formhandler" scope="request" />
<%@include file="formhandler.jsi" %>
<%
    formhandler.setMovingAction();
%>
<jsp:useBean class="net.i2p.router.web.helpers.SummaryHelper" id="summaryhelper" scope="request" />
<jsp:setProperty name="summaryhelper" property="contextId" value="<%=i2pcontextId%>" />
<h3 class="tabletitle"><%=intl._t("Refresh Interval")%></h3>
<form action="" method="POST">
<table class="configtable" id="refreshsidebar">
<tr>
<td>
<input type="hidden" name="nonce" value="<%=pageNonce%>" >
<input type="hidden" name="group" value="0">
<input type="text" name="refreshInterval" maxlength="4" pattern="[0-9]{1,4}" required value="<jsp:getProperty name="intl" property="refresh" />" >
<%=intl._t("seconds")%>
</td>
<td class="optionsave">
<input type="submit" name="action" class="accept" value="<%=intl._t("Save")%>" >
</td>
</tr>
</table>
</form>
<h3 class="tabletitle"><%=intl._t("Customize Sidebar")%></h3>
<form action="" method="POST">
<input type="hidden" name="nonce" value="<%=pageNonce%>" >
<input type="hidden" name="group" value="2">
<jsp:getProperty name="summaryhelper" property="configTable" />
<div class="formaction" id="sidebardefaults">
<input type="submit" class="reload" name="action" value="<%=intl._t("Restore full default")%>" >
<input type="submit" class="reload" name="action" value="<%=intl._t("Restore minimal default")%>" >
</div>
</form>
</div>
<script nonce="<%=cspNonce%>" type="text/javascript">progressx.hide();</script>
</body>
</html>
