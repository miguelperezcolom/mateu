package io.mateu.util.runtime;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;

public class MemInfo {

    public MemInfo() {

        MemoryMXBean memBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heap = memBean.getHeapMemoryUsage();
        MemoryUsage nonheap = memBean.getNonHeapMemoryUsage();


    }


    @Override
    public String toString() {
        String s = "";
        s += "Max Memory   : " + Runtime.getRuntime().maxMemory();
        s += "\n";
        s += "Total Memory : " + Runtime.getRuntime().totalMemory();
        s += "\n";
        s += "Free Memory  : " + Runtime.getRuntime().freeMemory();
        return s;
    }
}
