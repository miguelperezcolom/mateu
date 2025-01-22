<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
    <xsl:template match="/">

        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">


            <!--

            ********************************************************************************

            ESTE ES EL FORMATO NORMAL

            ********************************************************************************

             -->



            <fo:layout-master-set>
                <fo:simple-page-master master-name="odd" page-height="{/root/@height}" page-width="{/root/@width}" margin-top="1cm" margin-bottom="1cm" margin-left="1cm" margin-right="1cm">
                    <!--
                    <fo:simple-page-master master-value="odd" page-height="29.7cm" page-width="21cm" margin-top="1cm" margin-bottom="1cm" margin-left="1.5cm" margin-right="1.5cm">
                     -->
                    <fo:region-body region-name="xsl-region-body" margin-top="0.5cm" margin-bottom="0.5cm" margin-left="0cm" margin-right="0cm"/>
                    <!-- DEFINICION CABECERA DE PAGINA -->
                    <fo:region-before precedence="true" region-name="xsl-region-before" extent="0.5cm"/>
                    <!-- DEFINICION PIE DE PAGINA -->
                    <fo:region-after region-name="xsl-region-after" extent="0.5cm" precedence="true"/>
                </fo:simple-page-master>
            </fo:layout-master-set>


            <fo:page-sequence master-reference="odd" force-page-count="no-force" initial-page-number="1">
                <!-- CABECERA -->
                <fo:static-content flow-name="xsl-region-before">
                    <fo:table table-layout="fixed" padding-top="0.2cm">
                        <xsl:for-each select="/root/header/column">
                            <fo:table-column column-width="{@width}px"/>
                        </xsl:for-each>
                        <fo:table-body>
                            <fo:table-row font-weight="bold" background-color="#CCCCCC">
                                <xsl:for-each select="/root/header/column">
                                    <fo:table-cell border-width="0.1mm" border-style="solid" padding="2pt">
                                        <fo:block text-align="{@align}" font-size="9px"><xsl:value-of select="@label" /></fo:block>
                                    </fo:table-cell>
                                </xsl:for-each>
                            </fo:table-row>
                        </fo:table-body>
                    </fo:table>
                </fo:static-content>


                <fo:static-content flow-name="xsl-region-after" display-align="after">
                    <fo:block font-size="7px" text-align="center"></fo:block>
                    <fo:block font-size="7px" text-align="center">
                        Página <fo:page-number/> de <fo:page-number-citation ref-id="last-page"/>
                    </fo:block>
                </fo:static-content>


                <fo:flow flow-name="xsl-region-body" font-size="9pt">


                    <fo:block>Pendiente!</fo:block>

<!--

                    <fo:table table-layout="fixed" padding-top="0.2cm">
                        <xsl:for-each select="/root/header/column">
                            <fo:table-column column-width="{@width}px"/>
                        </xsl:for-each>
                        <fo:table-body>
                            <xsl:for-each select="/root/lines/line">
                                <fo:table-row>
                                    <xsl:for-each select="cell">
                                        <xsl:variable name="pos" select="position()"/>
                                        <xsl:if test="$pos &lt;= count(/root/header/column)">
                                            <fo:table-cell border-width="0.1mm" border-style="solid" padding="2pt">
                                                <fo:block text-align="{/root/header/column[position() = $pos]/@align}" font-size="8px" space-before="0.1mm" space-after="0.1mm"><xsl:value-of select="."/></fo:block>
                                            </fo:table-cell>
                                        </xsl:if>
                                    </xsl:for-each>
                                </fo:table-row>

                            </xsl:for-each>


                        </fo:table-body>
                    </fo:table>
-->


                    <fo:block id="last-page"/>

                </fo:flow>


            </fo:page-sequence>

        </fo:root>

    </xsl:template>
</xsl:stylesheet>
