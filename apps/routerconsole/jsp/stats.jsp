<%@page contentType="text/html"%>
<%@page trimDirectiveWhitespaces="true"%>
<%@page pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<%@include file="css.jsi" %>
<%=intl.title("statistics")%>
<%@include file="summaryajax.jsi" %>
</head>
<body>
<script nonce="<%=cspNonce%>" type="text/javascript">progressx.show();</script>
<%@include file="summary.jsi" %>
<jsp:useBean class="net.i2p.router.web.helpers.OldConsoleHelper" id="oldhelper" scope="request" />
<jsp:setProperty name="oldhelper" property="contextId" value="<%=i2pcontextId%>" />
<% oldhelper.storeWriter(out); %>
<jsp:setProperty name="oldhelper" property="full" value="<%=request.getParameter(\"f\")%>" />
<h1 class="perf"><%=intl._t("Router Statistics")%></h1>
<div class="main" id="stats">
<jsp:getProperty name="oldhelper" property="stats" />
</div>
<script nonce="<%=cspNonce%>" type="text/javascript">progressx.hide();</script>
</body>
</html>
