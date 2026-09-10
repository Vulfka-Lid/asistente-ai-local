Set WshShell = CreateObject("WScript.Shell")

' Ejecuta el servidor de Python de forma totalmente invisible (0 = ventana oculta)
WshShell.Run "cmd /c python -m http.server 8000", 0, False

' Espera 1 segundo antes de abrir la interfaz en el navegador por defecto
WScript.Sleep 1000
WshShell.Run "http://localhost:8000"