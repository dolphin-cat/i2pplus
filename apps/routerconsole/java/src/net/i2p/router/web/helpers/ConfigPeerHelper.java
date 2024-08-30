package net.i2p.router.web.helpers;

import java.io.StringWriter;
import java.math.BigInteger;
import java.util.Collections;
import java.util.List;

import net.i2p.data.Hash;
import net.i2p.router.Blocklist;
import net.i2p.router.web.HelperBase;
import net.i2p.util.Addresses;


public class ConfigPeerHelper extends HelperBase {

    private static final int MAX_DISPLAY = 1000;

    public String getBlocklistSummary() {
        StringWriter out = new StringWriter(4*1024);
        Blocklist bl = _context.blocklist();

        out.write("<table id=bannedips><tr><td>");

        // permabanned
        out.write("<table id=permabanned><tr><th colspan=3><b>");
        out.write(_t("IPs Permanently Banned"));
        out.write("</b></th></tr>");
        int blocklistSize = bl.getBlocklistSize();
        if (blocklistSize > 0) {
            out.write("<tr><td><b>");
            out.write(_t("From"));
            out.write("</b></td><td></td><td><b>");
            out.write(_t("To"));
            out.write("</b></td></tr>");
            long[] blocklist = bl.getPermanentBlocks(MAX_DISPLAY);
            // first 0 - 127
            for (int i = 0; i < blocklist.length; i++) {
                int from = Blocklist.getFrom(blocklist[i]);
                if (from < 0)
                    continue;
                out.write("<tr><td>");
                out.write(Blocklist.toStr(from));
                out.write("</td>");
                int to = Blocklist.getTo(blocklist[i]);
                if (to != from) {
                    out.write("<td>-</td><td>");
                    out.write(Blocklist.toStr(to));
                    out.write("</td></tr>\n");
                } else {
                    out.write("<td></td><td>&nbsp;</td></tr>\n");
                }
            }
            // then 128 - 255
            for (int i = 0; i < blocklist.length; i++) {
                int from = Blocklist.getFrom(blocklist[i]);
                if (from >= 0)
                    break;
                out.write("<tr><td>");
                out.write(Blocklist.toStr(from));
                out.write("</td>");
                int to = Blocklist.getTo(blocklist[i]);
                if (to != from) {
                    out.write("<td>-</td><td>");
                    out.write(Blocklist.toStr(to));
                    out.write("</td></tr>\n");
                } else {
                    out.write("<td></td><td>&nbsp;</td></tr>\n");
                }
            }
            if (blocklistSize > MAX_DISPLAY)
                // very rare, don't bother translating
                out.write("<tr><th colspan=3>First " + MAX_DISPLAY + " displayed, see the " +
                          Blocklist.BLOCKLIST_FILE_DEFAULT + " file for the full list</th></tr>");
        } else {
            out.write("<tr><td><i>");
            out.write(_t("none"));
            out.write("</i></td></tr>");
        }
        out.write("</table>");

        out.write("</td><td id=sessionIpBans width=50%>");

        // session banned
        out.write("<table id=banneduntilrestart><tr><th><b>");
        out.write(_t("IPs Banned Until Restart"));
        out.write("</b></th></tr>");
        List<Integer> singles = bl.getTransientIPv4Blocks();
        List<BigInteger> s6 = bl.getTransientIPv6Blocks();
        if (!(singles.isEmpty() && s6.isEmpty())) {
            if (!singles.isEmpty()) {
                Collections.sort(singles);
                out.write("<tr id=ipv4><td><b>");
                out.write(_t("IPv4 Addresses"));
                out.write("</b></td></tr>");
            }
            // first 0 - 127
            for (Integer ii : singles) {
                 int ip = ii.intValue();
                 if (ip < 0)
                     continue;
                 // don't display if on the permanent blocklist also
                 if (bl.isPermanentlyBlocklisted(ip))
                     continue;
                 out.write("<tr><td>");
                 out.write(Blocklist.toStr(ip));
                 out.write("</td></tr>\n");
            }
            // then 128 - 255
            for (Integer ii : singles) {
                 int ip = ii.intValue();
                 if (ip >= 0)
                     break;
                 // don't display if on the permanent blocklist also
                 if (bl.isPermanentlyBlocklisted(ip))
                     continue;
                 out.write("<tr><td>");
                 out.write(Blocklist.toStr(ip));
                 out.write("</td></tr>\n");
            }
            // then IPv6
            if (!s6.isEmpty()) {
                out.write("<tr id=ipv6><td><b>");
                out.write(_t("IPv6 Addresses"));
                out.write("</b></td></tr>");
                Collections.sort(s6);
                for (BigInteger bi : s6) {
                     out.write("<tr><td>");
                     out.write(Addresses.toString(toIPBytes(bi)));
                     out.write("</td></tr>\n");
                }
            }
        } else {
            out.write("<tr><td><i>");
            out.write(_t("none"));
            out.write("<style>#sessionIpBans{display:none!important}</style>");
            out.write("</i></td></tr>\n");
        }
        out.write("</table>");

        out.write("</td></tr></table>\n");
        return out.toString();
    }

    /**
     *  @since 0.9.50
     */
    public boolean isBanned(Hash h) {
        return _context.banlist().isBanlisted(h);
    }

    /**
     *  Convert a (non-negative) two's complement IP to exactly 16 bytes
     *
     *  @since IPv6, moved from Blocklist in 0.9.48
     */
    private static byte[] toIPBytes(BigInteger bi) {
        byte[] ba = bi.toByteArray();
        int len = ba.length;
        if (len == 16)
            return ba;
        byte[] rv = new byte[16];
        if (len < 16)
            System.arraycopy(ba, 0, rv, 16 - len, len);
        else
            System.arraycopy(ba, len - 16, rv, 0, 16);
        return rv;
    }
}
