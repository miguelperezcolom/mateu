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
;
; NOTHING HERE MAY DELETE WHAT IT DID NOT INSTALL (a sibling of this script once took a developer's
; /Applications). So the location is fixed (no directory page, /D= is ignored), a folder there with
; somebody else's files is refused, and the uninstaller removes named entries and then only an EMPTY
; folder. Pinned by InstallerScriptsTest.

Unicode true
; NOT /SOLID: the bundle is ~3.6 GB uncompressed (the IntelliJ distribution), and makensis 3.10
; dies with SIGBUS building one solid block that size (reproduced: exit 135 on the real bundle).
; Per-file LZMA builds it and the setup is ~950 MB.
SetCompressor lzma
RequestExecutionLevel user

!include "MUI2.nsh"
!include "FileFunc.nsh"

Name "${PRODUCT}"
OutFile "${OUT_FILE}"
InstallDir "$LOCALAPPDATA\Programs\${PRODUCT}"
BrandingText "${PRODUCT} ${VERSION}"

!define MUI_ICON "${SRC_DIR}/${SLUG}.ico"
!define MUI_UNICON "${SRC_DIR}/${SLUG}.ico"
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Start ${PRODUCT}"
!define MUI_FINISHPAGE_RUN_FUNCTION StartApp
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

!define UNINSTALL_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${SLUG}"

Function .onInit
  ; the fixed location, whatever /D= said; refused when it holds files that are not an install of ours
  StrCpy $INSTDIR "$LOCALAPPDATA\Programs\${PRODUCT}"
  ${DirState} "$INSTDIR" $0
  IntCmp $0 1 0 installHere installHere
  IfFileExists "$INSTDIR\Uninstall.exe" installHere
  MessageBox MB_OK|MB_ICONSTOP "$INSTDIR already exists and is not a ${PRODUCT} installation. Move it away and run this installer again." /SD IDOK
  Abort
  installHere:
FunctionEnd

Function un.onInit
  ; only the folder the installer recorded, and only if it is an install: a copied Uninstall.exe removes nothing
  ReadRegStr $0 HKCU "Software\${SLUG}" "InstallDir"
  StrCmp $0 "$INSTDIR" 0 notAnInstall
  IfFileExists "$INSTDIR\mateu.bat" 0 notAnInstall
  Goto uninstallHere
  notAnInstall:
  MessageBox MB_OK|MB_ICONSTOP "This uninstaller does not belong to $INSTDIR, so nothing was removed." /SD IDOK
  Abort
  uninstallHere:
FunctionEnd

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
    ; the IDE's own executable, never a batch file: cmd.exe would parse the link as a command line.
    ; The platform takes the URL as the whole command line and MateuProtocolHandler opens the workspace.
    WriteRegStr HKCU "Software\Classes\mateu\shell\open\command" "" '"$INSTDIR\bin\idea64.exe" "%1"'
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
    StrCmp $0 '"$INSTDIR\bin\idea64.exe" "%1"' 0 +2
      DeleteRegKey HKCU "Software\Classes\mateu"
  !endif
  DeleteRegKey HKCU "${UNINSTALL_KEY}"
  DeleteRegKey HKCU "Software\${SLUG}"
  ; what the bundle installed, by name, then what the app itself keeps beside it
  !include "${CLEAN_NSH}"
  RMDir /r "$INSTDIR\data"
  RMDir /r "$INSTDIR\workspace"
  Delete "$INSTDIR\Uninstall.exe"
  ; no /r: anything left that is not ours stays
  RMDir "$INSTDIR"
SectionEnd
