Imports System.Reflection
Imports System.IO
Imports Hqub.Lastfm
Imports System.Net
Imports System.Text

Public Class MainForm

#Region "Form Control"

    Private Sub TopGradientPanel_DoubleClick(sender As Object, e As EventArgs) Handles TopGradientPanel.DoubleClick
        If Me.WindowState = FormWindowState.Maximized Then
            Me.WindowState = FormWindowState.Normal
        Else
            Me.WindowState = FormWindowState.Maximized
        End If
    End Sub

    Private Sub btn_minimize_Click(sender As Object, e As EventArgs) Handles btn_minimize.Click
        Me.WindowState = FormWindowState.Minimized
    End Sub

    Private Sub btn_maximize_Click(sender As Object, e As EventArgs) Handles btn_maximize.Click
        If Me.WindowState = FormWindowState.Maximized Then
            Me.WindowState = FormWindowState.Normal
        Else
            Me.WindowState = FormWindowState.Maximized
        End If
    End Sub

    Private Sub btn_close_Click(sender As Object, e As EventArgs) Handles btn_close.Click
        Application.Exit()
    End Sub

    Private drag As Boolean
    Private mousex As Integer
    Private mousey As Integer
    Private Sub Form1_MouseDown(ByVal sender As Object, ByVal e As System.Windows.Forms.MouseEventArgs) Handles TopGradientPanel.MouseDown
        If e.Button = Windows.Forms.MouseButtons.Left Then

            'If Me.WindowState = FormWindowState.Maximized Then
            '    Dim maximizedX As Double = e.X / Me.Width
            '    Me.WindowState = FormWindowState.Normal
            '    Dim leftOffset = MousePosition().X
            '    Me.Location = New Point(leftOffset - Me.Width * maximizedX, 0)
            'End If

            drag = True
            mousex = Cursor.Position.X - Me.Left
            mousey = Cursor.Position.Y - Me.Top
        End If
    End Sub
    Private Sub Form1_MouseMove(ByVal sender As Object, ByVal e As System.Windows.Forms.MouseEventArgs) Handles TopGradientPanel.MouseMove
        If drag Then
            If Me.WindowState = FormWindowState.Maximized Then Me.WindowState = FormWindowState.Normal
            Me.Left = Cursor.Position.X - mousex
            Me.Top = Cursor.Position.Y - mousey
        End If
    End Sub

    Private Sub Form1_MouseUp(ByVal sender As Object, ByVal e As System.Windows.Forms.MouseEventArgs) Handles TopGradientPanel.MouseUp
        drag = False
    End Sub

    Private handlePosition As String
    Private handleLock As String = ""
    Private Sub ResizeHandle_MouseMove(sender As Object, e As MouseEventArgs) Handles rightHandlePanel.MouseMove, bottomHandlePanel.MouseMove
        If handleLock = "" Then
            If e.X >= (bottomHandlePanel.Width - 20) Or e.Y >= (leftHandlePanel.Height - 20) Then
                Me.Cursor = Cursors.SizeNWSE 'Corner drag
                handlePosition = "corner"
            ElseIf sender.name = "rightHandlePanel" Then
                Me.Cursor = Cursors.SizeWE 'Right drag
                handlePosition = "right"
            ElseIf sender.name = "bottomHandlePanel" Then
                Me.Cursor = Cursors.SizeNS 'Bottom drag
                handlePosition = "bottom"
            Else
                handlePosition = ""
                Me.Cursor = Cursors.Default
            End If
        End If
    End Sub

    Private Sub ResizeHandle_MouseLeave(sender As Object, e As EventArgs) Handles rightHandlePanel.MouseLeave, bottomHandlePanel.MouseLeave
        handlePosition = ""
        Me.Cursor = Cursors.Default
    End Sub

    Private Sub ResizeHandle_MouseDown(sender As Object, e As MouseEventArgs) Handles rightHandlePanel.MouseDown, bottomHandlePanel.MouseDown
        If handlePosition <> "" Then
            handleLock = handlePosition
            resizeTimer.Start()
        End If
    End Sub

    Private Sub ResizeTimer_Tick(sender As Object, e As EventArgs) Handles resizeTimer.Tick
        Select Case handleLock
            Case "corner"
                Me.Size = New Point(Cursor.Position.X - Me.Location.X, Cursor.Position.Y - Me.Location.Y)
            Case "right"
                Me.Size = New Point(Cursor.Position.X - Me.Location.X, Me.Height)
            Case "bottom"
                Me.Size = New Point(Me.Width, Cursor.Position.Y - Me.Location.Y)
            Case Else
                resizeTimer.Stop()
        End Select
    End Sub

    Private Sub Handle_MouseUp(sender As Object, e As MouseEventArgs) Handles rightHandlePanel.MouseUp, bottomHandlePanel.MouseUp
        handleLock = ""
    End Sub

#End Region

    Private Async Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Load

        'Reduces UI flickering during GDI+ graphics processing
        Me.SetStyle(ControlStyles.AllPaintingInWmPaint, True)
        Me.SetStyle(ControlStyles.OptimizedDoubleBuffer, True)
        Dim systemType As Type
        Dim propertyInfo As PropertyInfo
        For Each control In Me.Controls
            systemType = control.GetType()
            propertyInfo = systemType.GetProperty("DoubleBuffered", BindingFlags.Instance Or BindingFlags.NonPublic)
            propertyInfo.SetValue(control, True, Nothing)
        Next control
        systemType = SearchTextBox.GetType()
        propertyInfo = systemType.GetProperty("DoubleBuffered", BindingFlags.Instance Or BindingFlags.NonPublic)
        propertyInfo.SetValue(SearchTextBox, True, Nothing)

        'Create local library directory if it doesn't exist
        If Directory.Exists(Globals.libraryDirectory) = False Then
            Directory.CreateDirectory(Globals.libraryDirectory)
        End If

        'Load all songs into datagrid

        'Last.FM API Key Information
        'Application Name: tuna_app
        'API key: 36293abc07dc583ced82977f86b99c78
        'Shared secret: b0a2d804d98c70d1d977b42d2dc391a1
        'Registered to: yu89
        'Email used: billyshears489@gmail.com
        Dim lastFM As New LastfmClient("36293abc07dc583ced82977f86b99c78")
        Dim test = Await lastFM.Album.GetInfoAsync("Pearl Jam", "Black",)
        PictureBox1.ImageLocation = test.Images(2).Url


        'https://docs.audd.io/#recognize

        Dim binStr As String = ""
        Dim filestream = New FileStream(path:="C:\Users\Chris\Desktop\Recording 15s.m4a", mode:=FileMode.OpenOrCreate, access:=FileAccess.Read)

        Dim StreamReader = New StreamReader(stream:=filestream)
        Do While StreamReader.Peek > -1
            binStr &= streamreader.ReadLine()
        Loop

        ' Create a request using a URL that can receive a post.
        Dim request As WebRequest = WebRequest.Create("https://api.audd.io/")
        ' Set the Method property of the request to POST.
        request.Method = "POST"

        ' Create POST data and convert it to a byte array.
        'Dim postData As String = "url=https://audd.tech/example1.mp3&return=apple_music,spotify&api_token=test"
        Dim postData As String = "file=" & binStr & "&return=apple_music,spotify&api_token=test"

        Dim byteArray As Byte() = Encoding.UTF8.GetBytes(postData)
        ' Set the ContentType property of the WebRequest.
        request.ContentType = "application/x-www-form-urlencoded"
        ' Set the ContentLength property of the WebRequest.
        request.ContentLength = byteArray.Length
        ' Get the request stream.
        Dim dataStream As Stream = request.GetRequestStream()
        ' Write the data to the request stream.
        dataStream.Write(byteArray, 0, byteArray.Length)
        ' Close the Stream object.
        dataStream.Close()
        ' Get the response.
        Dim response As WebResponse = request.GetResponse()
        ' Display the status.
        Console.WriteLine(CType(response, HttpWebResponse).StatusDescription)
        ' Open the stream using a StreamReader for easy access.
        Dim reader As StreamReader = New StreamReader(response.GetResponseStream())
        ' Read the content.
        Dim responseFromServer As String = reader.ReadToEnd()
        ' Display the content.
        For Each item In responseFromServer.Split(",")
            Console.WriteLine(item)
        Next
        ' Close the response.
        response.Close()

    End Sub


End Class
