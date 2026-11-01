; Mateu desktop — Windows installer (NSIS). Built by `./gradlew buildInstaller -Pinstaller.platform=windows`
; with makensis on the PATH; every value comes in as a -D define:
;   PRODUCT     display name ("Mateu")            SLUG     file-safe name ("mateu")
;   VERSION     the plugin/app version            SRC_DIR  the portable bundle to install
;   OUT_FILE    the setup .exe to write           HUB      true|false — register mateu:// links
;   CLEAN_NSH   generated include: RMDir lines for what an upgrade replaces
;
; Per-user, no admin: installs into %LOCALAPPDATA%\Programs\<PRODUCT>, Start-menu + desktop
; shortcuts, an entry in Apps & features, and (hub) HKCU\Software\Classes\mateu. Upgrading over an
; existing install keeps data\config (settings, sign-ins) and the workspace; the IDE, the plugin and
; any staged update are replaced.

Unicode true
; NOT /SOLID: the bundle is ~3.6 GB uncompressed (the IntelliJ distribution), and makensis 3.10
; dies with SIGBUS building one solid block that size (reproduced: exit 135 on the real bundle).
; Per-file LZMA builds it and the setup is ~950 MB.
SetCompressor lzma
RequestExecutionLevel user

!include "MUI2.nsh"

Name "${PRODUCT}"
OutFile "${OUT_FILE}"
InstallDir "$LOCALAPPDATA\Programs\${PRODUCT}"
InstallDirRegKey HKCU "Software\${SLUG}" "InstallDir"
BrandingText "${PRODUCT} ${VERSION}"

!define MUI_ICON "${SRC_DIR}/${SLUG}.ico"
!define MUI_UNICON "${SRC_DIR}/${SLUG}.ico"
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Start ${PRODUCT}"
!define MUI_FINISHPAGE_RUN_FUNCTION StartApp
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

!define UNINSTALL_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${SLUG}"

Function StartApp
  ; the launcher waits for the IDE (it applies updates on restart) — keep its console minimised
  Exec '"$SYSDIR\cmd.exe" /c start "" /min "$INSTDIR\mateu.bat"'
FunctionEnd

Section "Install"
  SetOutPath "$INSTDIR"
  ; an upgrade: drop the previous IDE, plugin and staged update, keep data\config and the workspace
  !include "${CLEAN_NSH}"
  File /r "${SRC_DIR}/*"

  CreateShortCut "$SMPROGRAMS\${PRODUCT}.lnk" "$INSTDIR\mateu.bat" "" "$INSTDIR\${SLUG}.ico" 0 SW_SHOWMINIMIZED
  CreateShortCut "$DESKTOP\${PRODUCT}.lnk" "$INSTDIR\mateu.bat" "" "$INSTDIR\${SLUG}.ico" 0 SW_SHOWMINIMIZED

  !if "${HUB}" == "true"
    WriteRegStr HKCU "Software\Classes\mateu" "" "URL:Mateu UI link"
    WriteRegStr HKCU "Software\Classes\mateu" "URL Protocol" ""
    WriteRegStr HKCU "Software\Classes\mateu\DefaultIcon" "" "$INSTDIR\${SLUG}.ico,0"
    WriteRegStr HKCU "Software\Classes\mateu\shell\open\command" "" '"$INSTDIR\mateu.bat" "%1"'
  !endif

  WriteRegStr HKCU "Software\${SLUG}" "InstallDir" "$INSTDIR"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayName" "${PRODUCT}"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "Publisher" "${PRODUCT}"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayIcon" "$INSTDIR\${SLUG}.ico"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINSTALL_KEY}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINSTALL_KEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  Delete "$SMPROGRAMS\${PRODUCT}.lnk"
  Delete "$DESKTOP\${PRODUCT}.lnk"
  !if "${HUB}" == "true"
    ; only when the handler is still ours (another Mateu app may have claimed mateu:// since)
    ReadRegStr $0 HKCU "Software\Classes\mateu\shell\open\command" ""
    StrCmp $0 '"$INSTDIR\mateu.bat" "%1"' 0 +2
      DeleteRegKey HKCU "Software\Classes\mateu"
  !endif
  DeleteRegKey HKCU "${UNINSTALL_KEY}"
  DeleteRegKey HKCU "Software\${SLUG}"
  RMDir /r "$INSTDIR"
SectionEnd
