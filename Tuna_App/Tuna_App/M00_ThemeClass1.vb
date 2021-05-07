Imports System.Drawing.Text
Imports System.Drawing.Drawing2D
Imports System.ComponentModel
Imports Transitions
Imports BevelPanel
Imports System.Reflection

' Xylos Theme.
' Last Update 3/25/19
' Original Source Code Credited to AeroRev9.
' Source code has been heavily modified by Christopher Yu - Beacon Communities LLC, Boston MA
' Note: Transitions reference must be imported from the DLL file
' https://code.google.com/archive/p/dot-net-transitions/

Public Module Helpers

    Enum RoundingStyle As Byte
        All = 0
        Top = 1
        Bottom = 2
        Left = 3
        Right = 4
        TopRight = 5
        BottomRight = 6
    End Enum

    Public Sub CenterString(G As Graphics, T As String, F As Font, C As Color, R As Rectangle)
        Dim TS As SizeF = G.MeasureString(T, F)

        Using B As New SolidBrush(C)
            G.DrawString(T, F, B, New Point(R.Width / 2 - (TS.Width / 2), R.Height / 2 - (TS.Height / 2)))
        End Using
    End Sub

    Public Function ColorFromHex(Hex As String) As Color
        Return Color.FromArgb(Long.Parse(String.Format("FFFFFFFFFF{0}", Hex.Substring(1)), Globalization.NumberStyles.HexNumber))
    End Function

    Public Function FullRectangle(S As Size, Subtract As Boolean) As Rectangle

        If Subtract Then
            Return New Rectangle(0, 0, S.Width - 1, S.Height - 1)
        Else
            Return New Rectangle(0, 0, S.Width, S.Height)
        End If

    End Function

    Public Function XylosRoundRect(ByVal Rect As Rectangle, ByVal Rounding As Integer, Optional ByVal Style As RoundingStyle = RoundingStyle.All) As Drawing2D.GraphicsPath

        Dim GP As New Drawing2D.GraphicsPath()
        Dim AW As Integer = Rounding * 2

        GP.StartFigure()

        If Rounding = 0 Then
            GP.AddRectangle(Rect)
            GP.CloseAllFigures()
            Return GP
        End If

        Select Case Style
            Case RoundingStyle.All
                GP.AddArc(New Rectangle(Rect.X, Rect.Y, AW, AW), -180, 90)
                GP.AddArc(New Rectangle(Rect.Width - AW + Rect.X, Rect.Y, AW, AW), -90, 90)
                GP.AddArc(New Rectangle(Rect.Width - AW + Rect.X, Rect.Height - AW + Rect.Y, AW, AW), 0, 90)
                GP.AddArc(New Rectangle(Rect.X, Rect.Height - AW + Rect.Y, AW, AW), 90, 90)
            Case RoundingStyle.Top
                GP.AddArc(New Rectangle(Rect.X, Rect.Y, AW, AW), -180, 90)
                GP.AddArc(New Rectangle(Rect.Width - AW + Rect.X, Rect.Y, AW, AW), -90, 90)
                GP.AddLine(New Point(Rect.X + Rect.Width, Rect.Y + Rect.Height), New Point(Rect.X, Rect.Y + Rect.Height))
            Case RoundingStyle.Bottom
                GP.AddLine(New Point(Rect.X, Rect.Y), New Point(Rect.X + Rect.Width, Rect.Y))
                GP.AddArc(New Rectangle(Rect.Width - AW + Rect.X, Rect.Height - AW + Rect.Y, AW, AW), 0, 90)
                GP.AddArc(New Rectangle(Rect.X, Rect.Height - AW + Rect.Y, AW, AW), 90, 90)
            Case RoundingStyle.Left
                GP.AddArc(New Rectangle(Rect.X, Rect.Y, AW, AW), -180, 90)
                GP.AddLine(New Point(Rect.X + Rect.Width, Rect.Y), New Point(Rect.X + Rect.Width, Rect.Y + Rect.Height))
                GP.AddArc(New Rectangle(Rect.X, Rect.Height - AW + Rect.Y, AW, AW), 90, 90)
            Case RoundingStyle.Right
                GP.AddLine(New Point(Rect.X, Rect.Y + Rect.Height), New Point(Rect.X, Rect.Y))
                GP.AddArc(New Rectangle(Rect.Width - AW + Rect.X, Rect.Y, AW, AW), -90, 90)
                GP.AddArc(New Rectangle(Rect.Width - AW + Rect.X, Rect.Height - AW + Rect.Y, AW, AW), 0, 90)
            Case RoundingStyle.TopRight
                GP.AddLine(New Point(Rect.X, Rect.Y + 1), New Point(Rect.X, Rect.Y))
                GP.AddArc(New Rectangle(Rect.Width - AW + Rect.X, Rect.Y, AW, AW), -90, 90)
                GP.AddLine(New Point(Rect.X + Rect.Width, Rect.Y + Rect.Height - 1), New Point(Rect.X + Rect.Width, Rect.Y + Rect.Height))
                GP.AddLine(New Point(Rect.X + 1, Rect.Y + Rect.Height), New Point(Rect.X, Rect.Y + Rect.Height))
            Case RoundingStyle.BottomRight
                GP.AddLine(New Point(Rect.X, Rect.Y + 1), New Point(Rect.X, Rect.Y))
                GP.AddLine(New Point(Rect.X + Rect.Width - 1, Rect.Y), New Point(Rect.X + Rect.Width, Rect.Y))
                GP.AddArc(New Rectangle(Rect.Width - AW + Rect.X, Rect.Height - AW + Rect.Y, AW, AW), 0, 90)
                GP.AddLine(New Point(Rect.X + 1, Rect.Y + Rect.Height), New Point(Rect.X, Rect.Y + Rect.Height))
        End Select

        GP.CloseAllFigures()

        Return GP

    End Function

End Module

Public Class XylosButton
    Inherits Control

#Region "Declarations"

    Enum MouseState As Byte
        None = 0
        Over = 1
        Down = 2
    End Enum

    Private G As Graphics
    Private State As MouseState

    Private _EnabledCalc As Boolean
    Private _CornerRadius As Integer
    Private _MouseOverColor1
    Private _MouseOverColor2
    Private _MouseDownColor1
    Private _MouseDownColor2
    Private _BackColor1
    Private _BackColor2
    Private _BorderColor
    Private _OutlineColor1
    Private _OutlineColor2
    Private _BorderThickness
    Private _TextColor
    Private _Font
    Private _MouseEnterTransitionTime
    Private _MouseLeaveTransitionTime
    Private _CornerRoundingStyle

    Public Shadows Event Click(sender As Object, e As EventArgs)

#End Region

#Region "Properties"

    Sub New()
        DoubleBuffered = True
        Enabled = True
        SetStyle(ControlStyles.SupportsTransparentBackColor, True)

        Me.BackColor = Color.Transparent
        Me.BackColor1 = Color.Transparent
        Me.BackColor2 = BackColor1
        Me.Font1 = New Font("Segoe UI", 10)
        Me.ForeColor1 = Color.White
        Me.BorderColor = Color.White
        Me.outlinecolor1 = Color.White
        Me.outlinecolor2 = Color.White
        Me.CornerRadius = 15
        Me.MouseOverColor1 = Color.FromArgb(50, 255, 255, 255)
        Me.MouseOverColor2 = MouseOverColor1
        Me.MouseDownColor1 = Color.FromArgb(100, 255, 255, 255)
        Me.MouseDownColor2 = MouseDownColor1
        Me.MouseEnterTransitionTime = 150
        Me.MouseLeaveTransitionTime = 150
        Me.BorderThickness = 1
        Me.CornerRoundingStyle = RoundingStyle.All

        State = MouseState.None : Invalidate()

    End Sub

    Public Shadows Property Enabled As Boolean
        Get
            Return EnabledCalc
        End Get
        Set(value As Boolean)
            _EnabledCalc = value
            Invalidate()
        End Set
    End Property

    <ComponentModel.DisplayName("Enabled")>
    Public Property EnabledCalc As Boolean
        Get
            Return _EnabledCalc
        End Get
        Set(value As Boolean)
            Enabled = value
            Invalidate()
        End Set
    End Property

    <Category("Control")>
    Public Property CornerRadius As Integer
        Get
            Return _CornerRadius
        End Get
        Set(value As Integer)
            _CornerRadius = value
        End Set
    End Property

    <Category("Control")>
    Public Property BorderThickness As Integer
        Get
            Return _BorderThickness
        End Get
        Set(value As Integer)
            _BorderThickness = value
        End Set
    End Property

    <Category("Colours")>
    Public Property MouseOverColor1 As Color
        Get
            Return _MouseOverColor1
        End Get
        Set(value As Color)
            _MouseOverColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property MouseOverColor2 As Color
        Get
            Return _MouseOverColor2
        End Get
        Set(value As Color)
            _MouseOverColor2 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property MouseDownColor1 As Color
        Get
            Return _MouseDownColor1
        End Get
        Set(value As Color)
            _MouseDownColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property MouseDownColor2 As Color
        Get
            Return _MouseDownColor2
        End Get
        Set(value As Color)
            _MouseDownColor2 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property BackColor1 As Color
        Get
            Return _BackColor1
        End Get
        Set(value As Color)
            _BackColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property BackColor2 As Color
        Get
            Return _BackColor2
        End Get
        Set(value As Color)
            _BackColor2 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property OutlineColor1 As Color
        Get
            Return _OutlineColor1
        End Get
        Set(value As Color)
            _OutlineColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property OutlineColor2 As Color
        Get
            Return _OutlineColor2
        End Get
        Set(value As Color)
            _OutlineColor2 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property BorderColor As Color
        Get
            Return _BorderColor
        End Get
        Set(value As Color)
            _BorderColor = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property ForeColor1 As Color
        Get
            Return _TextColor
        End Get
        Set(value As Color)
            _TextColor = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property Font1 As Font
        Get
            Return _Font
        End Get
        Set(value As Font)
            _Font = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property MouseLeaveTransitionTime As Integer
        Get
            Return _MouseLeaveTransitionTime
        End Get
        Set(value As Integer)
            _MouseLeaveTransitionTime = value
        End Set
    End Property

    <Category("Control")>
    Public Property MouseEnterTransitionTime As Integer
        Get
            Return _MouseEnterTransitionTime
        End Get
        Set(value As Integer)
            _MouseEnterTransitionTime = value
        End Set
    End Property

    <Category("Control")>
    Public Property CornerRoundingStyle As RoundingStyle
        Get
            Return _CornerRoundingStyle
        End Get
        Set(value As RoundingStyle)
            _CornerRoundingStyle = value
        End Set
    End Property

#End Region

#Region "Draw Control"

    Protected Overrides Sub OnPaint(e As PaintEventArgs)

        G = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit

        MyBase.OnPaint(e)

        If Enabled Then

            Dim gradientColor1, gradientColor2 As Color

            Select Case State

                Case MouseState.Over

                    gradientColor1 = _MouseOverColor1
                    gradientColor2 = _MouseOverColor2

                    Using Background As New LinearGradientBrush(New Rectangle(0, 0, Me.Width, Me.Height), gradientColor1, gradientColor2, LinearGradientMode.Horizontal)
                        G.FillPath(Background, XylosRoundRect(FullRectangle(Size, True), _CornerRadius, _CornerRoundingStyle))
                    End Using

                Case MouseState.Down

                    gradientColor1 = _MouseDownColor1
                    gradientColor2 = _MouseDownColor2

                    Using Background As New LinearGradientBrush(New Rectangle(0, 0, Me.Width, Me.Height), gradientColor1, gradientColor2, LinearGradientMode.Horizontal)
                        G.FillPath(Background, XylosRoundRect(FullRectangle(Size, True), _CornerRadius, _CornerRoundingStyle))
                    End Using

                Case Else

                    gradientColor1 = _BackColor1
                    gradientColor2 = _BackColor2

                    Using Background As New LinearGradientBrush(New Rectangle(0, 0, Me.Width, Me.Height), gradientColor1, gradientColor2, LinearGradientMode.Horizontal)
                        G.FillPath(Background, XylosRoundRect(FullRectangle(Size, True), _CornerRadius, _CornerRoundingStyle))
                    End Using

            End Select

            gradientColor1 = _OutlineColor1
            gradientColor2 = _OutlineColor2

            'Draw the button border
            Using Border As New Pen(New LinearGradientBrush(New Rectangle(0, 0, Me.Width, Me.Height), gradientColor1, gradientColor2, LinearGradientMode.Horizontal), _BorderThickness)
                G.DrawPath(Border, XylosRoundRect(FullRectangle(Size, True), _CornerRadius, _CornerRoundingStyle))
                CenterString(G, Text, _Font, _TextColor, FullRectangle(Size, False))
            End Using

        Else

            Dim gradientColor1, gradientColor2 As Color

            gradientColor1 = Color.DimGray
                gradientColor2 = Color.DimGray

                'Draw the button border
                Using Border As New Pen(New LinearGradientBrush(New Rectangle(0, 0, Me.Width, Me.Height), gradientColor1, gradientColor2, LinearGradientMode.Horizontal), _BorderThickness)
                G.DrawPath(Border, XylosRoundRect(FullRectangle(Size, True), _CornerRadius, _CornerRoundingStyle))
                CenterString(G, Text, _Font, Color.DimGray, FullRectangle(Size, False))
                End Using

            End If

    End Sub

    Private setTransition As Boolean = False
    Private TransitionColor1, TransitionColor2 As Color

    Protected Overrides Sub OnMouseEnter(e As EventArgs)
        If setTransition = False Then
            TransitionColor1 = BackColor1
            TransitionColor2 = BackColor2
            setTransition = True
        End If
        If MouseEnterTransitionTime > 0 Then
            Transitions.Transition.run(Me, "BackColor1", _MouseOverColor1, New TransitionType_EaseInEaseOut(_MouseEnterTransitionTime))
            Transitions.Transition.run(Me, "BackColor2", _MouseOverColor2, New TransitionType_EaseInEaseOut(_MouseEnterTransitionTime))
        Else
            BackColor1 = MouseOverColor1
            BackColor2 = MouseOverColor2
        End If
        MyBase.OnMouseEnter(e)
        State = MouseState.Over : Invalidate()
    End Sub

    Protected Overrides Sub OnMouseLeave(e As EventArgs)
        If MouseLeaveTransitionTime > 0 Then
            Transitions.Transition.run(Me, "BackColor1", TransitionColor1, New TransitionType_EaseInEaseOut(_MouseLeaveTransitionTime))
            Transitions.Transition.run(Me, "BackColor2", TransitionColor2, New TransitionType_EaseInEaseOut(_MouseLeaveTransitionTime))
        Else
            BackColor1 = TransitionColor1
            BackColor2 = TransitionColor2
        End If
        MyBase.OnMouseLeave(e)
        State = MouseState.None : Invalidate()
    End Sub

    Protected Overrides Sub OnMouseUp(e As MouseEventArgs)
        MyBase.OnMouseUp(e)

        If Enabled Then
            RaiseEvent Click(Me, e)
        End If

        State = MouseState.Over : Invalidate()
    End Sub

    Protected Overrides Sub OnMouseDown(e As MouseEventArgs)
        MyBase.OnMouseDown(e)
        State = MouseState.Down : Invalidate()
    End Sub

#End Region

End Class

<ComponentModel.DefaultEvent("TextChanged")>
Public Class XylosTextBox ' NOTE: this class inherits from the Xylos XylosTextBox_Underline class. If you are going to port this class elsewhere, you must also bring the XylosTextBox_Underline class with it
    Inherits Control

#Region "Declarations"

    Enum MouseState As Byte
        None = 0
        Over = 1
        Down = 2
    End Enum

    Private G As Graphics
    Private State As MouseState
    Private IsDown As Boolean

    Private _EnabledCalc As Boolean
    Private _allowpassword As Boolean = False
    Private _maxChars As Integer = 32767
    Private _textAlignment As HorizontalAlignment
    Private _multiLine As Boolean = False
    Private _readOnly As Boolean = False
    Private _cornerRadius As Integer
    Private _password As Boolean
    Private _BackColor1 As Color
    Private _BorderColor As Color

    Private WithEvents TRTB As New TransparentTextBox()

#End Region

#Region "Properties"

    <Category("Colours")>
    Public Property BackColor1 As Color
        Get
            Return _BackColor1
        End Get
        Set(value As Color)
            _BackColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property BorderColor As Color
        Get
            Return _BorderColor
        End Get
        Set(value As Color)
            _BorderColor = value
            Invalidate()

        End Set
    End Property

    <ComponentModel.DisplayName("Password")>
    Public Property Password As Boolean
        Get
            Return _password
        End Get
        Set(ByVal value As Boolean)
            _password = value
            Invalidate()
        End Set
    End Property

    <Category("Control")>
    Public Property CornerRadius As Integer
        Get
            Return _cornerRadius
        End Get
        Set(value As Integer)
            _cornerRadius = value
        End Set
    End Property

    Public Shadows Property Enabled As Boolean
        Get
            Return EnabledCalc
        End Get
        Set(value As Boolean)
            TRTB.Enabled = value
            _EnabledCalc = value
            Invalidate()
        End Set
    End Property

    <ComponentModel.DisplayName("Enabled")>
    Public Property EnabledCalc As Boolean
        Get
            Return _EnabledCalc
        End Get
        Set(value As Boolean)
            Enabled = value
            Invalidate()
        End Set
    End Property

    Public Shadows Property MaxLength() As Integer
        Get
            Return _maxChars
        End Get
        Set(ByVal value As Integer)
            _maxChars = value
            TRTB.MaxLength = MaxLength
            Invalidate()
        End Set
    End Property

    Public Shadows Property TextAlign() As HorizontalAlignment
        Get
            Return _textAlignment
        End Get
        Set(ByVal value As HorizontalAlignment)
            _textAlignment = value
            Invalidate()
        End Set
    End Property

    Public Shadows Property MultiLine() As Boolean
        Get
            Return _multiLine
        End Get
        Set(ByVal value As Boolean)
            _multiLine = value
            TRTB.Multiline = value
            OnResize(EventArgs.Empty)
            Invalidate()
        End Set
    End Property

    Public Shadows Property [ReadOnly]() As Boolean
        Get
            Return _readOnly
        End Get
        Set(ByVal value As Boolean)
            _readOnly = value
            If TRTB IsNot Nothing Then
                TRTB.ReadOnly = value
            End If
        End Set
    End Property

    Protected Overrides Sub OnTextChanged(ByVal e As EventArgs)
        MyBase.OnTextChanged(e)
        Invalidate()
    End Sub

    Protected Overrides Sub OnBackColorChanged(ByVal e As EventArgs)
        MyBase.OnBackColorChanged(e)
        Invalidate()
    End Sub

    Protected Overrides Sub OnForeColorChanged(ByVal e As EventArgs)
        MyBase.OnForeColorChanged(e)
        TRTB.ForeColor = ForeColor
        Invalidate()
    End Sub

    Protected Overrides Sub OnFontChanged(ByVal e As EventArgs)
        MyBase.OnFontChanged(e)
        TRTB.Font = Font
    End Sub

    Protected Overrides Sub OnGotFocus(ByVal e As EventArgs)
        MyBase.OnGotFocus(e)
        TRTB.Focus()
    End Sub

    Private Class TransparentTextBox
        Inherits XylosTextBox_Underline

        Public Sub New()
            SetStyle(ControlStyles.SupportsTransparentBackColor, True)
            With Me
                .UnderlineEnabled = False
                .UnderlineDistance = 0
                .BorderStyle = BorderStyle.None
                .Location = New Point(3, 3)
                .Font = New Font("Segoe UI", 9)
                .Size = New Size(Width - 3, Height - 3)

            End With

        End Sub

    End Class

    Public Sub New()

        MyBase.New()

        Controls.Add(TRTB)
        SetStyle(ControlStyles.SupportsTransparentBackColor, True)
        DoubleBuffered = True
        BorderColor = Color.White
        BackColor = Color.Transparent
        BackColor1 = Color.FromArgb(20, 255, 255, 255)
        Enabled = True

    End Sub

#End Region

#Region "Draw Control"

    Protected Overrides Sub OnPaint(ByVal e As PaintEventArgs)

        SetStyle(ControlStyles.SupportsTransparentBackColor, True)

        G = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit

        MyBase.OnPaint(e)

        'G.Clear(Color.Transparent)

        If Enabled Then
            If State = MouseState.Down Then
                Using Border As New Pen(BorderColor)
                    G.FillPath(New SolidBrush(BackColor1), XylosRoundRect(FullRectangle(Size, True), CornerRadius))
                    G.DrawPath(Border, XylosRoundRect(FullRectangle(Size, True), _cornerRadius))
                End Using
            Else
                Using Border As New Pen(BorderColor)
                    G.FillPath(New SolidBrush(BackColor1), XylosRoundRect(FullRectangle(Size, True), CornerRadius))
                    G.DrawPath(Border, XylosRoundRect(FullRectangle(Size, True), _cornerRadius))
                End Using
            End If
        Else
            Using Border As New Pen(ColorFromHex("#E1E1E2"))
                G.FillPath(New SolidBrush(Color.FromArgb(50, 255, 255, 255)), XylosRoundRect(FullRectangle(Size, True), CornerRadius))
                G.DrawPath(Border, XylosRoundRect(FullRectangle(Size, True), _cornerRadius))
            End Using
        End If

    End Sub

    Protected Overrides Sub OnResize(e As EventArgs)
        MyBase.OnResize(e)
        If Not MultiLine Then
            Dim tbheight As Integer = TRTB.Height
            TRTB.Location = New Point(10, CType(((Height / 2) - (tbheight / 2) - 0), Integer))
            TRTB.Size = New Size(Width - 20, tbheight)
        Else
            TRTB.Location = New Point(10, 10)
            TRTB.Size = New Size(Width - 20, Height - 20)
        End If
    End Sub

    Protected Overrides Sub OnEnter(e As EventArgs)
        MyBase.OnEnter(e)

        If Me.Password = True Then
            Me.TRTB.Password = True
        Else
            Me.TRTB.Password = False
        End If

        State = MouseState.Down : Invalidate()
    End Sub

    Protected Overrides Sub OnLeave(e As EventArgs)
        MyBase.OnLeave(e)
        State = MouseState.None : Invalidate()
    End Sub

    Private Sub XylosTextBox_Border_PreviewKeyDown(sender As Object, e As PreviewKeyDownEventArgs) Handles TRTB.PreviewKeyDown
        If Me.Password = True Then
            Me.TRTB.Password = True
        Else
            Me.TRTB.Password = False
        End If
    End Sub

    Private Sub TextChangeTb() Handles TRTB.TextChanged
        Me.Text = TRTB.Text
    End Sub

    Private Sub TextChangeMe() Handles Me.TextChanged

        If Not Me.TRTB.Focused Then
            TRTB.Text = Me.Text
            TRTB.Invalidate()
        End If

    End Sub


    'Make transparent textbox's events mimic the events of the parent control
    Public Shadows Event MouseEnter(ByVal controlName As String)
    Private Sub TRTB_MouseEnter(sender As Object, e As EventArgs) Handles TRTB.MouseEnter
        RaiseEvent MouseEnter(TRTB.Parent.Name)
    End Sub

    Public Shadows Event MouseLeave(ByVal controlName As String)
    Private Sub TRTB_MouseLeave(sender As Object, e As EventArgs) Handles TRTB.MouseLeave
        RaiseEvent MouseLeave(TRTB.Parent.Name)
    End Sub

#End Region

    Private Class XylosTextBox_Underline
        Inherits RichTextBox

#Region "Declarations"

        Private _maxChars As Integer = 9999
        Private _backColor As Color = Color.Transparent
        Private _password As Boolean
        Private _underlineColor As Color = Color.White
        Private _underlineThickness As Integer = 1
        Private _underlineDistance As Integer = 5
        Private _underlineEnabled As Boolean = True
        Private G As Graphics

#End Region

#Region "Properties"

        Public Sub New()

            DoubleBuffered = True
            SetStyle(ControlStyles.SupportsTransparentBackColor, True)
            SetStyle(ControlStyles.OptimizedDoubleBuffer, True)
            SetStyle(ControlStyles.AllPaintingInWmPaint, True)
            SetStyle(ControlStyles.ResizeRedraw, True)

            MyBase.Multiline = False
            MyBase.ScrollBars = RichTextBoxScrollBars.None
            MyBase.BorderStyle = BorderStyle.None
            MyBase.BackColor = Color.Transparent
            MyBase.AutoWordSelection = False
            MyBase.MaximumSize = New Size(99999, MyBase.FontHeight + UnderlineDistance)
            MyBase.MinimumSize = New Size(5, MyBase.FontHeight + UnderlineDistance)

        End Sub

        Protected Overrides ReadOnly Property CreateParams() As System.Windows.Forms.CreateParams

            Get
                Dim cp As CreateParams = MyBase.CreateParams

                cp.ExStyle = cp.ExStyle Or &H20 'This is used to set the background of the richtextbox as transparent

                'The following code is another method to mask the richtextbox for passwords, however, it only allows for asterisks to be displayed as the mask
                'If Password = True Then
                '    cp.Style = cp.Style Or Asc("*") 'This is used to mask and encrypt the characters for password protection
                'End If
                Return cp
            End Get
        End Property

        Protected Overrides Sub OnForeColorChanged(ByVal e As EventArgs)
            MyBase.OnForeColorChanged(e)
            MyBase.ForeColor = ForeColor
            Invalidate()
        End Sub

        <ComponentModel.DisplayName("Underline Enabled")>
        Public Property UnderlineEnabled As Boolean
            Get
                Return _underlineEnabled
            End Get
            Set(ByVal value As Boolean)
                _underlineEnabled = value
                Invalidate()
            End Set
        End Property

        <ComponentModel.DisplayName("Underline Color")>
        Public Property UnderlineColor As Color
            Get
                Return _underlineColor
            End Get
            Set(ByVal value As Color)
                _underlineColor = value
                Invalidate()
            End Set
        End Property

        <ComponentModel.DisplayName("Underline Distance")>
        <ComponentModel.Description("2 is min value")>
        Public Property UnderlineDistance As Integer
            Get
                Return _underlineDistance
            End Get
            Set(ByVal value As Integer)
                _underlineDistance = value
                MyBase.MaximumSize = New Size(99999, MyBase.FontHeight + _underlineDistance)
                MyBase.MinimumSize = New Size(5, MyBase.FontHeight + _underlineDistance)
                Invalidate()
            End Set
        End Property

        <ComponentModel.DisplayName("Underline Thickness")>
        Public Property UnderlineThickness As Integer
            Get
                Return _underlineThickness
            End Get
            Set(ByVal value As Integer)
                _underlineThickness = value
                Invalidate()
            End Set
        End Property

        <ComponentModel.DisplayName("Password")>
        Public Property Password As Boolean
            Get
                Return _password
            End Get
            Set(ByVal value As Boolean)
                _password = value
                Invalidate()
            End Set
        End Property

        <ComponentModel.DisplayName("Max Character Length")>
        Public Property MaxChars As Integer
            Get
                Return _maxChars
            End Get
            Set(ByVal value As Integer)
                _maxChars = value
                MyBase.MaxLength = MaxChars
                Invalidate()
            End Set
        End Property

        Private Sub XylosTextBox_Underline_FontChanged(sender As Object, e As EventArgs) Handles Me.FontChanged
            MyBase.MaximumSize = New Size(99999, MyBase.FontHeight + UnderlineDistance)
            MyBase.MinimumSize = New Size(5, MyBase.FontHeight + UnderlineDistance)
        End Sub

        Private Sub XylosTextBox_Underline_TextChanged(sender As Object, e As EventArgs) Handles Me.TextChanged, Me.SelectionChanged
            Try
                MyBase.Parent.Refresh()
            Catch ex As Exception
                Err.Clear()
            End Try

        End Sub

#End Region

#Region "Draw Control"

        'Paint the Underline on top of the textbox
        Private Const WM_PAINT As Integer = 15
        'This is effectively the paint event of the custom control
        Protected Overrides Sub WndProc(ByRef m As Message)
            If m.Msg = WM_PAINT Then
                Me.Invalidate()
                MyBase.WndProc(m)
                If UnderlineEnabled = True Then
                    Using g As Graphics = Graphics.FromHwnd(Me.Handle)
                        g.DrawLine(New Pen(UnderlineColor, UnderlineThickness), New Point(0, Me.ClientSize.Height - 1), New Point(Me.ClientSize.Width - 1, Me.ClientSize.Height - 1))
                    End Using
                End If
            Else
                MyBase.WndProc(m)
            End If

        End Sub

        Private Declare Function SendMessage Lib "user32" Alias "SendMessageA" (ByVal hwnd As IntPtr, ByVal wMsg As Integer, ByVal wParam As Integer, ByVal lParam As Integer) As Integer
        Private Const EM_SETPASSWORDCHAR As Integer = &HCC
        Private Sub XylosTextBox_Underline_KeyPress(sender As Object, e As PreviewKeyDownEventArgs) Handles Me.PreviewKeyDown
            If Password = True Then
                SendMessage(MyBase.Handle, EM_SETPASSWORDCHAR, Asc("•"), 0) 'This is used to mask and encrypt the characters for password protection
            End If
        End Sub

#End Region

    End Class

End Class

<ComponentModel.DefaultEvent("CheckedChanged")>
Public Class XylosCheckBox
    Inherits Control

#Region "Declarations"

    Public Event CheckedChanged(sender As Object, e As EventArgs)

    Private _Checked As Boolean
    Private _EnabledCalc As Boolean
    Private _checkboxColor As Color
    Private _checkboxBorderColor As Color
    Private _Font As Font
    Private G As Graphics

    Private B64Enabled As String = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA00lEQVQ4T6WTwQ2CMBSG30/07Ci6gY7gxZoIiYADuAIrsIDpQQ/cHMERZBOuXHimDSWALYL01EO/L//724JmLszk6S+BCOIExFsmL50sEH4kAZxVciYuJgnacD16Plpgg8tFtYMILntQdSXiZ3aXqa1UF/yUsoDw4wKglQaZZPa4RW3JEKzO4RjEbyJaN1BL8gvWgsMp3ADeq0lRJ2FimLZNYWpmFbudUJdolXTLyG2wTmDODUiccEfgSDIIfwmMxAMStS+XHPZn7l/z6Ifk+nSzBR8zi2d9JmVXSgAAAABJRU5ErkJggg=="
    Private B64Disabled As String = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA1UlEQVQ4T6WTzQ2CQBCF56EnLpaiXvUAJBRgB2oFtkALdEAJnoVEMIGzdEIFjNkFN4DLn+xpD/N9efMWQAsPFvL0lyBMUg8MiwzyZwuiJAuI6CyTMxezBC24EuSTBTp4xaaN6JWdqKQbge6udfB1pfbBjrMvEMZZAdCm3ilw7eO1KRmCxRyiOH0TsFUQs5KMwVLweKY7ALFKUZUTECD6qdquCxM7i9jNhLJEraQ5xZzrYJngO9crGYBbAm2SEfhHoCQGeeK+Ls1Ld+fuM0/+kPp+usWCD10idEOGa4QuAAAAAElFTkSuQmCC"

#End Region

#Region "Properties"

    <Category("Control")>
    Public Property Font1 As Font
        Get
            Return _Font
        End Get
        Set(value As Font)
            _Font = value
            Invalidate()

        End Set
    End Property

    Public Property Checked As Boolean
        Get
            Return _Checked
        End Get
        Set(value As Boolean)
            _Checked = value
            Invalidate()
        End Set
    End Property

    Public Shadows Property Enabled As Boolean
        Get
            Return EnabledCalc
        End Get
        Set(value As Boolean)
            _EnabledCalc = value

            If Enabled Then
                Cursor = Cursors.Hand
            Else
                Cursor = Cursors.Default
            End If

            Invalidate()
        End Set
    End Property

    <ComponentModel.DisplayName("Enabled")>
    Public Property EnabledCalc As Boolean
        Get
            Return _EnabledCalc
        End Get
        Set(value As Boolean)
            Enabled = value
            Invalidate()
        End Set
    End Property

    <ComponentModel.DisplayName("CheckBox Color")>
    Public Property CheckBoxColor As Color
        Get
            Return _checkboxColor
        End Get
        Set(value As Color)
            _checkboxColor = value
            Invalidate()
        End Set
    End Property

    <ComponentModel.DisplayName("CheckBox Border Color")>
    Public Property CheckBoxBorderColor As Color
        Get
            Return _checkboxBorderColor
        End Get
        Set(value As Color)
            _checkboxBorderColor = value
            Invalidate()
        End Set
    End Property

#End Region

#Region "Draw Control"

    Sub New()
        SetStyle(ControlStyles.SupportsTransparentBackColor, True)
        MyBase.BackColor = Color.Transparent
        CheckBoxBorderColor = Color.Gray
        CheckBoxColor = Color.WhiteSmoke
        ForeColor = Color.Black
        DoubleBuffered = True
        Enabled = True
        Font1 = New Font("Segoe UI", 9)
    End Sub

    Protected Overrides Sub OnPaint(e As PaintEventArgs)
        G = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit
        SetStyle(ControlStyles.SupportsTransparentBackColor, True)

        MyBase.OnPaint(e)

        'G.Clear(Color.White)

        If Enabled Then

            Using Background As New SolidBrush(CheckBoxColor), Border As New Pen(CheckBoxBorderColor), TextColor As New SolidBrush(ForeColor)
                G.FillPath(Background, XylosRoundRect(New Rectangle(0, (Height / 2) - 8, 16, 16), 3))
                G.DrawPath(Border, XylosRoundRect(New Rectangle(0, (Height / 2) - 8, 16, 16), 3))
                G.DrawString(Text, Font1, TextColor, New Point(25, (Height / 2) - Font1.Size))
            End Using

            If Checked Then

                Using I As Image = Image.FromStream(New IO.MemoryStream(Convert.FromBase64String(B64Enabled)))
                    G.DrawImage(I, New Rectangle(3, (Height / 2) - 4, 11, 11))
                End Using

            End If

        Else

            Using Background As New SolidBrush(ColorFromHex("#F5F5F8")), Border As New Pen(ColorFromHex("#E1E1E2")), TextColor As New SolidBrush(ColorFromHex("#D0D3D7"))
                G.FillPath(Background, XylosRoundRect(New Rectangle(0, (Height / 2) - 8, 16, 16), 3))
                G.DrawPath(Border, XylosRoundRect(New Rectangle(0, (Height / 2) - 8, 16, 16), 3))
                G.DrawString(Text, Font1, TextColor, New Point(25, (Height / 2) - Font1.Size))
            End Using

            If Checked Then

                Using I As Image = Image.FromStream(New IO.MemoryStream(Convert.FromBase64String(B64Disabled)))
                    G.DrawImage(I, New Rectangle(3, (Height / 2) - 4, 11, 11))
                End Using

            End If

        End If

    End Sub

#End Region

    Protected Overrides Sub OnMouseUp(e As MouseEventArgs)
        MyBase.OnMouseUp(e)

        If Enabled Then
            Checked = Not Checked
            RaiseEvent CheckedChanged(Me, e)
        End If

    End Sub

    Protected Overrides Sub OnResize(e As EventArgs)
        MyBase.OnResize(e)
        Size = New Size(Width, Height)
    End Sub

End Class

<ComponentModel.DefaultEvent("CheckedChanged")>
Public Class XylosRadioButton
    Inherits Control

#Region "Declarations"

    Public Event CheckedChanged(sender As Object, e As EventArgs)

    Private _Checked As Boolean
    Private _EnabledCalc As Boolean
    Private _Font As Font
    Private _buttonColor
    Private _buttonBorderColor
    Private _buttonCheckedColor
    Private G As Graphics

    <ComponentModel.DisplayName("Button Color")>
    Public Property ButtonColor As Color
        Get
            Return _buttonColor
        End Get
        Set(value As Color)
            _buttonColor = value
            Invalidate()
        End Set
    End Property

    <ComponentModel.DisplayName("Button Checked Color")>
    Public Property ButtonCheckedColor As Color
        Get
            Return _buttonCheckedColor
        End Get
        Set(value As Color)
            _buttonCheckedColor = value
            Invalidate()
        End Set
    End Property

    <ComponentModel.DisplayName("Button Border Color")>
    Public Property ButtonBorderColor As Color
        Get
            Return _buttonBorderColor
        End Get
        Set(value As Color)
            _buttonBorderColor = value
            Invalidate()
        End Set
    End Property

    <Category("Control")>
    Public Property Font1 As Font
        Get
            Return _Font
        End Get
        Set(value As Font)
            _Font = value
            Invalidate()

        End Set
    End Property

    Public Property Checked As Boolean
        Get
            Return _Checked
        End Get
        Set(value As Boolean)
            _Checked = value
            Invalidate()
        End Set
    End Property

    Public Shadows Property Enabled As Boolean
        Get
            Return EnabledCalc
        End Get
        Set(value As Boolean)
            _EnabledCalc = value

            If Enabled Then
                Cursor = Cursors.Hand
            Else
                Cursor = Cursors.Default
            End If

            Invalidate()
        End Set
    End Property

    <ComponentModel.DisplayName("Enabled")>
    Public Property EnabledCalc As Boolean
        Get
            Return _EnabledCalc
        End Get
        Set(value As Boolean)
            Enabled = value
            Invalidate()
        End Set
    End Property

    Sub New()
        SetStyle(ControlStyles.SupportsTransparentBackColor, True)
        DoubleBuffered = True
        Enabled = True
        Font1 = New Font("Segoe UI", 9)
        ButtonColor = Color.WhiteSmoke
        ButtonBorderColor = Color.Gray
        ForeColor = Color.Black
        Me.BackColor = Color.Transparent
    End Sub

#End Region

#Region "Draw Control"

    Protected Overrides Sub OnPaint(e As PaintEventArgs)
        G = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit
        SetStyle(ControlStyles.SupportsTransparentBackColor, True)

        MyBase.OnPaint(e)

        'G.Clear(Color.White)

        If Enabled Then

            Using Background As New SolidBrush(ButtonColor), Border As New Pen(ButtonBorderColor), TextColor As New SolidBrush(ForeColor)
                G.FillEllipse(Background, New Rectangle(0, (Height / 2) - 8, 16, 16))
                G.DrawEllipse(Border, New Rectangle(0, (Height / 2) - 8, 16, 16))
                G.DrawString(Text, Font1, TextColor, New Point(25, (Height / 2) - Font1.Size))
            End Using

            If Checked Then

                Using Background As New SolidBrush(ButtonCheckedColor)
                    G.FillEllipse(Background, New Rectangle(4, (Height / 2) - 4, 8, 8))
                End Using

            End If

        Else

            Using Background As New SolidBrush(ColorFromHex("#F5F5F8")), Border As New Pen(ColorFromHex("#E1E1E2")), TextColor As New SolidBrush(ColorFromHex("#D0D3D7"))
                G.FillEllipse(Background, New Rectangle(0, (Height / 2) - 8, 16, 16))
                G.DrawEllipse(Border, New Rectangle(0, (Height / 2) - 8, 16, 16))
                G.DrawString(Text, Font1, TextColor, New Point(25, (Height / 2) - Font1.Size))
            End Using

            If Checked Then

                Using Background As New SolidBrush(ColorFromHex("#BCC1C6"))
                    G.FillEllipse(Background, New Rectangle(4, (Height / 2) - 4, 8, 8))
                End Using

            End If

        End If

    End Sub

#End Region

    Protected Overrides Sub OnMouseUp(e As MouseEventArgs)
        MyBase.OnMouseUp(e)

        If Enabled Then

            For Each C As Control In Parent.Controls
                If TypeOf C Is XylosRadioButton Then
                    DirectCast(C, XylosRadioButton).Checked = False
                End If
            Next

            Checked = Not Checked
            RaiseEvent CheckedChanged(Me, e)
        End If

    End Sub

    Protected Overrides Sub OnResize(e As EventArgs)
        MyBase.OnResize(e)
        Size = New Size(Width, Height)
    End Sub

End Class

Public Class XylosSeparator
    Inherits Control

    Private G As Graphics

    Sub New()
        DoubleBuffered = True
    End Sub

    Protected Overrides Sub OnPaint(e As PaintEventArgs)
        G = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit

        MyBase.OnPaint(e)

        Using C As New Pen(ColorFromHex("#EBEBEC"))
            G.DrawLine(C, New Point(0, 0), New Point(Width, 0))
        End Using

    End Sub

    Protected Overrides Sub OnResize(e As EventArgs)
        MyBase.OnResize(e)
        Size = New Size(Width, Height)
    End Sub

End Class

Public Class XylosNotice
    Inherits TextBox

    Private G As Graphics
    Private B64 As String = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABL0lEQVQ4T5VT0VGDQBB9e2cBdGBSgTIDEr9MCw7pI0kFtgB9yFiC+KWMmREqMOnAAuDWOfAiudzhyA/svtvH7Xu7BOv5eH2atVKtwbwk0LWGGVyDqLzoRB7e3u/HJTQOdm+PGYjWNuk4ZkIW36RbkzsS7KqiBnB1Usw49DHh8oQEXMfJKhwgAM4/Mw7RIp0NeLG3ScCcR4vVhnTPnVCf9rUZeImTdKnz71VREnBnn5FKzMnX95jA2V6vLufkBQFESTq0WBXsEla7owmcoC6QJMKW2oCUePY5M0lAjK0iBAQ8TBGc2/d7+uvnM/AQNF4Rp4bpiGkRfTb2Gigx12+XzQb3D9JfBGaQzHWm7HS000RJ2i/av5fJjPDZMplErwl1GxDpMTbL1YC5lCwze52/AQFekh7wKBpGAAAAAElFTkSuQmCC"

    Sub New()
        DoubleBuffered = True
        Enabled = False
        [ReadOnly] = True
        BorderStyle = BorderStyle.None
        Multiline = True
        Cursor = Cursors.Default
    End Sub

    Protected Overrides Sub OnCreateControl()
        MyBase.OnCreateControl()
        SetStyle(ControlStyles.UserPaint, True)
    End Sub

    Protected Overrides Sub OnPaint(e As PaintEventArgs)
        G = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit

        MyBase.OnPaint(e)

        G.Clear(Color.White)

        Using Background As New SolidBrush(ColorFromHex("#FFFDE8")), MainBorder As New Pen(ColorFromHex("#F2F3F7")), TextColor As New SolidBrush(ColorFromHex("#B9B595")), TextFont As New Font("Segoe UI", 9)
            G.FillPath(Background, XylosRoundRect(FullRectangle(Size, True), 3))
            G.DrawPath(MainBorder, XylosRoundRect(FullRectangle(Size, True), 3))
            G.DrawString(Text, TextFont, TextColor, New Point(30, 6))
        End Using

        Using I As Image = Image.FromStream(New IO.MemoryStream(Convert.FromBase64String(B64)))
            G.DrawImage(I, New Rectangle(8, Height / 2 - 8, 16, 16))
        End Using

    End Sub

    Protected Overrides Sub OnMouseUp(e As MouseEventArgs)
        MyBase.OnMouseUp(e)

    End Sub

End Class

Public Class XylosProgressBar
    Inherits Control

#Region " Drawing "

    Private _Val As Integer = 0
    Private _Min As Integer = 0
    Private _Max As Integer = 100

    Public Property Stripes As Color = Color.DarkGreen
    Public Property BackgroundColor As Color = Color.Green


    Public Property Value As Integer
        Get
            Return _Val
        End Get
        Set(value As Integer)
            _Val = value
            Invalidate()
        End Set
    End Property

    Public Property Minimum As Integer
        Get
            Return _Min
        End Get
        Set(value As Integer)
            _Min = value
            Invalidate()
        End Set
    End Property

    Public Property Maximum As Integer
        Get
            Return _Max
        End Get
        Set(value As Integer)
            _Max = value
            Invalidate()
        End Set
    End Property

    Sub New()
        DoubleBuffered = True
        Maximum = 100
        Minimum = 0
        Value = 0
    End Sub

    Protected Overrides Sub OnPaint(e As PaintEventArgs)

        Dim G As Graphics = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit

        MyBase.OnPaint(e)

        'G.Clear(Color.White)

        Using Border As New Pen(ColorFromHex("#D0D5D9"))
            G.DrawPath(Border, XylosRoundRect(FullRectangle(Size, True), 6))
        End Using

        If Not Value = 0 Then

            Using Background As New Drawing2D.HatchBrush(Drawing2D.HatchStyle.LightUpwardDiagonal, Stripes, BackgroundColor)
                G.FillPath(Background, XylosRoundRect(New Rectangle(0, 0, Value / Maximum * Width - 1, Height - 1), 6))
            End Using

        End If


    End Sub

#End Region

End Class

Public Class XylosCombobox
    Inherits ComboBox

    Private G As Graphics
    Private Rect As Rectangle
    Private _EnabledCalc As Boolean
    Private _Color_ItemText As Color
    Private _Color_Border As Color
    Private _Color_ItemBackground As Color
    Private _Color_PrimaryText As Color
    Private _Color_ItemSelection As Color
    Private _Font1 As Font

    Public Shadows Property Enabled As Boolean
        Get
            Return EnabledCalc
        End Get
        Set(value As Boolean)
            _EnabledCalc = value
            Invalidate()
        End Set
    End Property

    <ComponentModel.DisplayName("Enabled")>
    Public Property EnabledCalc As Boolean
        Get
            Return _EnabledCalc
        End Get
        Set(value As Boolean)
            MyBase.Enabled = value
            Enabled = value
            Invalidate()
        End Set
    End Property

    <Category("Colours")>
    Public Property Color_ItemText As Color
        Get
            Return _Color_ItemText
        End Get
        Set(value As Color)
            _Color_ItemText = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property Color_Border As Color
        Get
            Return _Color_Border
        End Get
        Set(value As Color)
            _Color_Border = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property Color_ItemBackground As Color
        Get
            Return _Color_ItemBackground
        End Get
        Set(value As Color)
            _Color_ItemBackground = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property Color_PrimaryText As Color
        Get
            Return _Color_PrimaryText
        End Get
        Set(value As Color)
            _Color_PrimaryText = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property Color_ItemSelection As Color
        Get
            Return _Color_ItemSelection
        End Get
        Set(value As Color)
            _Color_ItemSelection = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property Font1 As Font
        Get
            Return _Font1
        End Get
        Set(value As Font)
            _Font1 = value
            Invalidate()

        End Set
    End Property

    Sub New()
        DoubleBuffered = True
        DropDownStyle = ComboBoxStyle.DropDownList
        Cursor = Cursors.Hand
        Enabled = True
        DrawMode = DrawMode.OwnerDrawFixed
        ItemHeight = 20
        Color_ItemText = Color.Black
        Color_Border = Color.Gainsboro
        Color_ItemBackground = Color.Gainsboro
        Color_PrimaryText = Color.SlateBlue
        Color_ItemSelection = Color.SlateGray
        Font1 = New Font("Segoe UI Light", 11)

    End Sub

    Protected Overrides Sub OnCreateControl()
        MyBase.OnCreateControl()

        SetStyle(ControlStyles.UserPaint, True)
    End Sub

    Protected Overrides Sub OnPaint(e As PaintEventArgs)
        G = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit

        MyBase.OnPaint(e)

        'G.Clear(Color.White)

        If Enabled Then

            Using Border As New Pen(Color_Border), TriangleColor As New SolidBrush(Color_PrimaryText), TriangleFont As New Font("Marlett", 13)
                G.DrawPath(Border, XylosRoundRect(FullRectangle(Size, True), 6))
                G.DrawString("6", TriangleFont, TriangleColor, New Point(Width - 22, 3))
            End Using

        Else

            Using Border As New Pen(Color_ItemText), TriangleColor As New SolidBrush(Color_ItemBackground), TriangleFont As New Font("Marlett", 13)
                G.DrawPath(Border, XylosRoundRect(FullRectangle(Size, True), 6))
                G.DrawString("6", TriangleFont, TriangleColor, New Point(Width - 22, 3))
            End Using

        End If

        If Not IsNothing(Items) Then

            Using ItemsFont As New Font("Segoe UI", 9), ItemsColor As New SolidBrush(Color_PrimaryText)

                If Enabled Then

                    If Not SelectedIndex = -1 Then
                        G.DrawString(GetItemText(Items(SelectedIndex)), Font1, ItemsColor, New Point(7, 4))
                        'Else
                        '    Try
                        '        G.DrawString(GetItemText(Items(0)), Font1, ItemsColor, New Point(7, 4))
                        '    Catch
                        '    End Try
                    End If

                Else

                    Using DisabledItemsColor As New SolidBrush(Color_ItemBackground)

                        If Not SelectedIndex = -1 Then
                            G.DrawString(GetItemText(Items(SelectedIndex)), Font1, DisabledItemsColor, New Point(7, 4))
                        Else
                            G.DrawString(GetItemText(Items(0)), Font1, DisabledItemsColor, New Point(7, 4))
                        End If

                    End Using

                End If

            End Using

        End If

    End Sub

    Protected Overrides Sub OnDrawItem(e As DrawItemEventArgs)
        MyBase.OnDrawItem(e)
        G = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit

        If Enabled Then
            e.DrawBackground()
            Rect = e.Bounds

            Try

                Using ItemsFont As New Font("Segoe UI", 9), Border As New Pen(Color_Border)

                    If (e.State And DrawItemState.Selected) = DrawItemState.Selected Then

                        Using ItemsColor As New SolidBrush(Color_ItemBackground), Itembackground As New SolidBrush(Color_ItemSelection)
                            G.FillRectangle(Itembackground, Rect)
                            G.DrawString(GetItemText(Items(e.Index)), Font1, ItemsColor, New Point(Rect.X + 5, Rect.Y + 1))
                        End Using
                        MyBase.SelectedIndex = e.Index

                    Else
                        Using ItemsColor2 As New SolidBrush(Color_ItemBackground)
                            G.FillRectangle(ItemsColor2, Rect)
                            G.DrawString(GetItemText(Items(e.Index)), Font1, New SolidBrush(Color_ItemText), New Point(Rect.X + 5, Rect.Y + 1))
                        End Using

                    End If

                End Using

            Catch
            End Try

        End If

    End Sub

    Protected Overrides Sub OnSelectedItemChanged(ByVal e As EventArgs)
        MyBase.OnSelectedItemChanged(e)
        Invalidate()
    End Sub

End Class

Public Class XylosTabControl
    Inherits TabControl

    Private G As Graphics
    Private Rect As Rectangle
    Private _OverIndex As Integer = -1
    Private _BackColor1
    Private _BackColor2
    Private _TextColor1
    Private _TabColor1
    Private _SelectedTabBackColor1
    Private _SelectedTabTextColor1
    Private _TextFont1

    Public Property FirstHeaderBorder As Boolean

    Private Property OverIndex As Integer
        Get
            Return _OverIndex
        End Get
        Set(value As Integer)
            _OverIndex = value
            Invalidate()
        End Set
    End Property

    <Category("Colours")>
    Public Property BackColor1 As Color
        Get
            Return _BackColor1
        End Get
        Set(value As Color)
            _BackColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property BackColor2 As Color
        Get
            Return _BackColor2
        End Get
        Set(value As Color)
            _BackColor2 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property TextColor1 As Color
        Get
            Return _TextColor1
        End Get
        Set(value As Color)
            _TextColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property TabColor1 As Color
        Get
            Return _TabColor1
        End Get
        Set(value As Color)
            _TabColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property SelectedTabBackColor1 As Color
        Get
            Return _SelectedTabBackColor1
        End Get
        Set(value As Color)
            _SelectedTabBackColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property SelectedTabTextColor1 As Color
        Get
            Return _SelectedTabTextColor1
        End Get
        Set(value As Color)
            _SelectedTabTextColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property Font1 As Font
        Get
            Return _TextFont1
        End Get
        Set(value As Font)
            _TextFont1 = value
            Invalidate()

        End Set
    End Property

    Sub New()
        DoubleBuffered = True
        Alignment = TabAlignment.Left
        SizeMode = TabSizeMode.Fixed
        ItemSize = New Size(40, 180)
        Me.BackColor1 = Color.FromArgb(30, 30, 30)
        Me.BackColor2 = Color.White
        Me.TextColor1 = Color.WhiteSmoke
        Me.TabColor1 = Color.SlateBlue
        Me.SelectedTabBackColor1 = Color.DarkSlateBlue
        Me.SelectedTabTextColor1 = Color.WhiteSmoke
        Me.Font1 = New Font("Segoe UI semibold", 9)

    End Sub

    Protected Overrides Sub OnCreateControl()
        MyBase.OnCreateControl()
        SetStyle(ControlStyles.UserPaint, True)
    End Sub

    Protected Overrides Sub OnControlAdded(e As ControlEventArgs)
        MyBase.OnControlAdded(e)
        e.Control.BackColor = BackColor2
        e.Control.ForeColor = SelectedTabBackColor1
        e.Control.Font = New Font("Segoe UI", 9)
    End Sub

    Protected Overrides Sub OnPaint(e As PaintEventArgs)
        G = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit

        MyBase.OnPaint(e)

        G.Clear(BackColor1)

        For I As Integer = 0 To TabPages.Count - 1

            Rect = GetTabRect(I)

            If String.IsNullOrEmpty(TabPages(I).Tag) Then

                If SelectedIndex = I Then

                    Using Background As New SolidBrush(SelectedTabBackColor1), TextColor As New SolidBrush(SelectedTabTextColor1), TextFont As New Font(Font1, FontStyle.Regular)
                        G.FillRectangle(Background, New Rectangle(Rect.X - 5, Rect.Y + 1, Rect.Width + 7, Rect.Height))
                        G.DrawString(TabPages(I).Text, TextFont, TextColor, New Point(Rect.X + 50 + (ItemSize.Height - 180), Rect.Y + 12))
                    End Using

                Else

                    Using TextColor As New SolidBrush(TextColor1), TextFont As New Font(Font1, FontStyle.Regular)
                        G.DrawString(TabPages(I).Text, TextFont, TextColor, New Point(Rect.X + 50 + (ItemSize.Height - 180), Rect.Y + 12))
                    End Using

                End If

                If Not OverIndex = -1 And Not SelectedIndex = OverIndex Then

                    Using Background As New SolidBrush(TabColor1), TextColor As New SolidBrush(TextColor1), TextFont As New Font(Font1, FontStyle.Regular)
                        G.FillRectangle(Background, New Rectangle(GetTabRect(OverIndex).X - 5, GetTabRect(OverIndex).Y + 1, GetTabRect(OverIndex).Width + 7, GetTabRect(OverIndex).Height))
                        G.DrawString(TabPages(OverIndex).Text, TextFont, TextColor, New Point(GetTabRect(OverIndex).X + 50 + (ItemSize.Height - 180), GetTabRect(OverIndex).Y + 12))
                    End Using

                    If Not IsNothing(ImageList) Then
                        If Not TabPages(OverIndex).ImageIndex < 0 Then
                            G.DrawImage(ImageList.Images(TabPages(OverIndex).ImageIndex), New Rectangle(GetTabRect(OverIndex).X + 25 + (ItemSize.Height - 180), GetTabRect(OverIndex).Y + ((GetTabRect(OverIndex).Height / 2) - 9), 16, 16))
                        End If
                    End If

                End If


                If Not IsNothing(ImageList) Then
                    If Not TabPages(I).ImageIndex < 0 Then
                        G.DrawImage(ImageList.Images(TabPages(I).ImageIndex), New Rectangle(Rect.X + 25 + (ItemSize.Height - 180), Rect.Y + ((Rect.Height / 2) - 9), 16, 16))
                    End If
                End If

            Else

                Using TextColor As New SolidBrush(TextColor1), TextFont As New Font(Font1, FontStyle.Bold), Border As New Pen(TextColor1)

                    If FirstHeaderBorder Then
                        G.DrawLine(Border, New Point(Rect.X - 5, Rect.Y + 1), New Point(Rect.Width + 7, Rect.Y + 1))
                    Else
                        If Not I = 0 Then
                            G.DrawLine(Border, New Point(Rect.X - 5, Rect.Y + 1), New Point(Rect.Width + 7, Rect.Y + 1))
                        End If
                    End If

                    G.DrawString(TabPages(I).Text.ToUpper, TextFont, TextColor, New Point(Rect.X + 25 + (ItemSize.Height - 180), Rect.Y + 16))

                End Using

            End If

        Next

    End Sub

    Protected Overrides Sub OnSelecting(e As TabControlCancelEventArgs)
        MyBase.OnSelecting(e)

        If Not IsNothing(e.TabPage) Then
            If Not String.IsNullOrEmpty(e.TabPage.Tag) Then
                e.Cancel = True
            Else
                OverIndex = -1
            End If
        End If

    End Sub

    Protected Overrides Sub OnMouseMove(e As MouseEventArgs)
        MyBase.OnMouseMove(e)

        For I As Integer = 0 To TabPages.Count - 1
            If GetTabRect(I).Contains(e.Location) And Not SelectedIndex = I And String.IsNullOrEmpty(TabPages(I).Tag) Then
                OverIndex = I
                Exit For
            Else
                OverIndex = -1
            End If
        Next

    End Sub

    Protected Overrides Sub OnMouseLeave(e As EventArgs)
        MyBase.OnMouseLeave(e)
        OverIndex = -1
    End Sub

End Class

Public Class DataGridViewProgressColumn
    Inherits DataGridViewImageColumn

    Public Sub New()
        CellTemplate = New DataGridViewProgressCell()
    End Sub
End Class

Class DataGridViewProgressCell
    Inherits DataGridViewImageCell

    Shared emptyImage As Image

    Shared Sub New()
        emptyImage = New Bitmap(1, 1, System.Drawing.Imaging.PixelFormat.Format32bppArgb)
    End Sub

    Public Sub New()
        Me.ValueType = GetType(Integer)
    End Sub

    Protected Overrides Function GetFormattedValue(ByVal value As Object, ByVal rowIndex As Integer, ByRef cellStyle As DataGridViewCellStyle, ByVal valueTypeConverter As TypeConverter, ByVal formattedValueTypeConverter As TypeConverter, ByVal context As DataGridViewDataErrorContexts) As Object
        Return emptyImage
    End Function

    Protected Overrides Sub Paint(ByVal g As System.Drawing.Graphics, ByVal clipBounds As System.Drawing.Rectangle, ByVal cellBounds As System.Drawing.Rectangle, ByVal rowIndex As Integer, ByVal cellState As DataGridViewElementStates, ByVal value As Object, ByVal formattedValue As Object, ByVal errorText As String, ByVal cellStyle As DataGridViewCellStyle, ByVal advancedBorderStyle As DataGridViewAdvancedBorderStyle, ByVal paintParts As DataGridViewPaintParts)
        Try
            Dim progressVal As Integer = CInt(value)
            Dim percentage As Single = (CSng(progressVal) / 100.0F)
            Dim backColorBrush As Brush = New SolidBrush(cellStyle.BackColor)
            Dim foreColorBrush As Brush = New SolidBrush(cellStyle.ForeColor)
            MyBase.Paint(g, clipBounds, cellBounds, rowIndex, cellState, value, formattedValue, errorText, cellStyle, advancedBorderStyle, (paintParts And Not DataGridViewPaintParts.ContentForeground))

            If percentage > 0.0 Then
                g.FillRectangle(New SolidBrush(Color.FromArgb(203, 235, 108)), cellBounds.X + 2, cellBounds.Y + 2, Convert.ToInt32((percentage * cellBounds.Width - 4)), cellBounds.Height - 4)
                g.DrawString(progressVal.ToString() & "%", cellStyle.Font, foreColorBrush, cellBounds.X + (cellBounds.Width / 2) - 5, cellBounds.Y + 2)
            Else

                If Me.DataGridView.CurrentRow.Index = rowIndex Then
                    g.DrawString(progressVal.ToString() & "%", cellStyle.Font, New SolidBrush(cellStyle.SelectionForeColor), cellBounds.X + 6, cellBounds.Y + 2)
                Else
                    g.DrawString(progressVal.ToString() & "%", cellStyle.Font, foreColorBrush, cellBounds.X + 6, cellBounds.Y + 2)
                End If
            End If

        Catch e As Exception
        End Try
    End Sub
End Class

Public Class Panel_DropShadow
    'This requires BevelPanel.dll to be included as a reference in the project
    Inherits BevelPanel.AdvancedPanel
    Public Sub New()
        Dim advancePanel As New BevelPanel.AdvancedPanel
        advancePanel.CreateControl()
    End Sub
End Class

Public Class Panel_DoubleBuffered
    Inherits Panel
    Public Sub New()
        Dim systemType As Type = Me.GetType()
        Dim propertyInfo As PropertyInfo = systemType.GetProperty("DoubleBuffered", BindingFlags.Instance Or BindingFlags.NonPublic)
        propertyInfo.SetValue(Me, True, Nothing)
    End Sub
End Class

Public Class MaterialTextBox

    Inherits Panel_DropShadow

    Private Class TransparentTextBox
        Inherits RichTextBox

        Public _password As Boolean

        Sub New()
            DoubleBuffered = True
            SetStyle(ControlStyles.SupportsTransparentBackColor, True)
            SetStyle(ControlStyles.OptimizedDoubleBuffer, True)
            SetStyle(ControlStyles.AllPaintingInWmPaint, True)
            SetStyle(ControlStyles.ResizeRedraw, True)
            MyBase.Multiline = False
            MyBase.ScrollBars = RichTextBoxScrollBars.None
            MyBase.BorderStyle = BorderStyle.None
            MyBase.BackColor = Color.Transparent
            MyBase.AutoWordSelection = False
            MyBase.MaximumSize = New Size(99999, MyBase.FontHeight)
            MyBase.MinimumSize = New Size(5, MyBase.FontHeight)
        End Sub

        Protected Overrides ReadOnly Property CreateParams() As System.Windows.Forms.CreateParams
            Get
                Dim cp As CreateParams = MyBase.CreateParams
                cp.ExStyle = cp.ExStyle Or &H20 'This is used to set the background of the richtextbox as transparent
                Return cp
            End Get
        End Property

        Private Declare Function SendMessage Lib "user32" Alias "SendMessageA" (ByVal hwnd As IntPtr, ByVal wMsg As Integer, ByVal wParam As Integer, ByVal lParam As Integer) As Integer
        Private Const EM_SETPASSWORDCHAR As Integer = &HCC

        Private Sub XylosTextBox_Underline_KeyPress(sender As Object, e As PreviewKeyDownEventArgs) Handles Me.PreviewKeyDown
            If password = True Then
                SendMessage(MyBase.Handle, EM_SETPASSWORDCHAR, Asc("•"), 0) 'This is used to mask and encrypt the characters for password protection
            End If
        End Sub

        Private Sub TransparentTextBox_TextChanged(sender As Object, e As EventArgs) Handles Me.TextChanged
            Try
                MyBase.Parent.Refresh()
            Catch ex As Exception
                Err.Clear()
            End Try
        End Sub

        <ComponentModel.DisplayName("Password")>
        Public Property password As Boolean
            Get
                Return _Password
            End Get
            Set(ByVal value As Boolean)
                _Password = value
                Invalidate()
            End Set
        End Property

    End Class

    Private G As Graphics
    Private lineProgress As Integer = 2
    Private animationTimer, invalidateTimer As New Timer
    Private WithEvents TRTB As New TransparentTextBox
    Private invalidateCounter As Integer = 0
    Private animationInProgress As Boolean = False
    Private totalLineProgress As Integer = 0
    Private textMaskVisible As Boolean = True

    Private _FontColor As Color
    Private _TextOffsetX As Integer
    Private _TextOffsetY As Integer
    Private _UnderlineColor As Color
    Private _UnderlineThickness As Integer
    Private _UnderlineOffsetLeft As Integer
    Private _UnderlineOffsetRight As Integer
    Private _TextCaption As String
    Private _TextPaddingRight As Integer
    Private _Password As Boolean
    Private _TextMask As String
    Private _UnderlineStatic As Boolean
    Private _UnderlineStaticColor As Color
    Private _AnimationSpeed As Integer
    Private _TextMaskColor As Color
    Private _MaxCharacters As Integer

    Public Shadows Event Click(sender As Object, e As EventArgs)

    <Category("Colours")>
    Public Property FontColor As Color
        Get
            Return _FontColor
        End Get
        Set(value As Color)
            _FontColor = value
            TRTB.ForeColor = _FontColor
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property TextMaskColor As Color
        Get
            Return _TextMaskColor
        End Get
        Set(value As Color)
            _TextMaskColor = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property UnderlineColor As Color
        Get
            Return _UnderlineColor
        End Get
        Set(value As Color)
            _UnderlineColor = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property TextPaddingRight As Integer
        Get
            Return _TextPaddingRight
        End Get
        Set(value As Integer)
            _TextPaddingRight = value
            TRTB.MinimumSize = New Point(Me.Width - RectRadius - ShadowShift - 20 - _TextOffsetX + _TextPaddingRight, Me.Height)
            TRTB.MaximumSize = New Point(Me.Width - RectRadius - ShadowShift - 20 - _TextOffsetX + _TextPaddingRight, Me.Height)
            Invalidate()
        End Set
    End Property

    <Category("Control")>
    Public Property TextOffsetX As Integer
        Get
            Return _TextOffsetX
        End Get
        Set(value As Integer)
            _TextOffsetX = value
            TRTB.Location = New Point(20 + _TextOffsetX, 20 + _TextOffsetY)
            Invalidate()
        End Set
    End Property

    <Category("Control")>
    Public Property TextOffsetY As Integer
        Get
            Return _TextOffsetY
        End Get
        Set(value As Integer)
            _TextOffsetY = value
            TRTB.Location = New Point(20 + _TextOffsetX, 20 + _TextOffsetY)
            Invalidate()
        End Set
    End Property

    <Category("Control")>
    Public Property UnderlineThickness As Integer
        Get
            Return _UnderlineThickness
        End Get
        Set(value As Integer)
            _UnderlineThickness = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property UnderlineOffsetLeft As Integer
        Get
            Return _UnderlineOffsetLeft
        End Get
        Set(value As Integer)
            _UnderlineOffsetLeft = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property UnderlineOffsetRight As Integer
        Get
            Return _UnderlineOffsetRight
        End Get
        Set(value As Integer)
            _UnderlineOffsetRight = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property TextCaption As String
        Get
            Return _TextCaption
        End Get
        Set(value As String)
            _TextCaption = value
            TRTB.Text = _TextCaption
            Invalidate()
        End Set
    End Property

    <Category("Control")>
    Public Property TextMask As String
        Get
            Return _TextMask
        End Get
        Set(value As String)
            _TextMask = value
            Invalidate()
        End Set
    End Property

    <Category("Control")>
    Public Property Password As Boolean
        Get
            Return _Password
        End Get
        Set(value As Boolean)
            _Password = value
            TRTB.password = _Password
            Invalidate()
        End Set
    End Property

    <Category("Control")>
    Public Property UnderlineStatic As Boolean
        Get
            Return _UnderlineStatic
        End Get
        Set(value As Boolean)
            _UnderlineStatic = value
            Invalidate()
        End Set
    End Property

    <Category("Colours")>
    Public Property UnderlineStaticColor As Color
        Get
            Return _UnderlineStaticColor
        End Get
        Set(value As Color)
            _UnderlineStaticColor = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property AnimationSpeed As Integer
        Get
            Return _AnimationSpeed
        End Get
        Set(value As Integer)
            _AnimationSpeed = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property MaxCharacters As Integer
        Get
            Return _MaxCharacters
        End Get
        Set(value As Integer)
            _MaxCharacters = value
            TRTB.MaxLength = _MaxCharacters
            Invalidate()
        End Set
    End Property

    Public Sub New()

        DoubleBuffered = True
        SetStyle(ControlStyles.OptimizedDoubleBuffer, True)
        _UnderlineThickness = 2
        _UnderlineOffsetLeft = 14
        _UnderlineOffsetRight = -2
        AddHandler invalidateTimer.Tick, AddressOf invalidateTimer_Tick
        invalidateTimer.Interval = 100
        AddHandler animationTimer.Tick, AddressOf animationTimer_Tick
        animationTimer.Interval = 5
        _UnderlineColor = Color.Fuchsia
        MyBase.Controls.Add(TRTB)
        _TextOffsetY = 0
        _TextOffsetX = 0
        TRTB.Location = New Point(20 + _TextOffsetY, 20 + _TextOffsetY)
        _TextCaption = "Material TextBox"
        _TextPaddingRight = 0
        _Password = False
        _UnderlineStatic = False
        _UnderlineStaticColor = Color.Gainsboro
        _AnimationSpeed = 10
        _TextMaskColor = _FontColor
        _MaxCharacters = 9999

        TRTB.MinimumSize = New Point(Me.Width - RectRadius - ShadowShift - 20 - _TextOffsetX + _TextPaddingRight, Me.Height)
        TRTB.MaximumSize = New Point(Me.Width - RectRadius - ShadowShift - 20 - _TextOffsetX + _TextPaddingRight, Me.Height)
        TRTB.BringToFront()
        TRTB.Invalidate()
        MyBase.Invalidate()

    End Sub

    Protected Overrides Sub OnPaint(e As PaintEventArgs)

        G = e.Graphics
        G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
        G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit

        MyBase.OnPaint(e)

        If _UnderlineStatic = True Then
            ' G.DrawLine(New Pen(New SolidBrush(_UnderlineStaticColor), _UnderlineThickness), New Point((Width - ShadowShift) / 2 + _UnderlineOffsetLeft - ((Width - RectRadius - ShadowShift) / 2), Height - ShadowShift - EdgeWidth - 1), New Point((Width - RectRadius - ShadowShift) / 2 + _UnderlineOffsetRight + ((Width - RectRadius - ShadowShift) / 2), Height - ShadowShift - EdgeWidth - 1))
            G.DrawLine(New Pen(New SolidBrush(_UnderlineStaticColor), _UnderlineThickness), New Point(_UnderlineOffsetLeft - (RectRadius / 2), Height - ShadowShift - EdgeWidth - 1), New Point((Width - RectRadius - ShadowShift) / 2 + _UnderlineOffsetRight + ((Width - RectRadius - ShadowShift) / 2), Height - ShadowShift - EdgeWidth - 1))

        End If

        If animationInProgress = True Then
            'Left half of line
            G.DrawLine(New Pen(New SolidBrush(_UnderlineColor), _UnderlineThickness), New Point((Width - ShadowShift) / 2 + 1 + _UnderlineOffsetLeft - lineProgress, Height - ShadowShift - EdgeWidth - 1), New Point((Width - RectRadius - ShadowShift) / 2 + 1, Height - ShadowShift - EdgeWidth - 1))
            'Right half of line
            G.DrawLine(New Pen(New SolidBrush(_UnderlineColor), _UnderlineThickness), New Point((Width - RectRadius - ShadowShift) / 2, Height - ShadowShift - EdgeWidth - 1), New Point((Width - RectRadius - ShadowShift) / 2 + _UnderlineOffsetRight + lineProgress, Height - ShadowShift - EdgeWidth - 1))
        Else
            If TRTB.Focused = True Then
                G.DrawLine(New Pen(New SolidBrush(_UnderlineColor), _UnderlineThickness), New Point((Width - ShadowShift) / 2 + 1 + _UnderlineOffsetLeft - totalLineProgress, Height - ShadowShift - EdgeWidth - 1), New Point((Width - RectRadius - ShadowShift) / 2 + _UnderlineOffsetRight + totalLineProgress, Height - ShadowShift - EdgeWidth - 1))
            End If
        End If

        If TRTB.Text = "" Then
            If textMaskVisible = False Then
                G.DrawString("", MyBase.Font, New SolidBrush(_TextMaskColor), New Point(TRTB.Location.X, TRTB.Location.Y))
            Else
                G.DrawString(_TextMask, MyBase.Font, New SolidBrush(_TextMaskColor), New Point(TRTB.Location.X, TRTB.Location.Y))
            End If
        End If

    End Sub

    Private Sub animationTimer_Tick()

        If lineProgress <= (Width - RectRadius - ShadowShift) / 2 Then
            lineProgress += AnimationSpeed
            totalLineProgress = lineProgress
            MyBase.Invalidate()
        Else
            animationInProgress = False
            animationTimer.Stop()
            lineProgress = 2
        End If

    End Sub

    Private Sub invalidateTimer_Tick()

        If invalidateCounter <= 3 Then
            invalidateCounter += 1
            MyBase.Invalidate()
        Else
            invalidateTimer.Stop()
        End If

    End Sub

    Private Sub MaterialTextBox_Enter(sender As Object, e As EventArgs) Handles TRTB.GotFocus, Me.GotFocus
        TRTB.Select()
        _TextCaption = TRTB.Text
        TRTB.password = Password
        textMaskVisible = False
        animationInProgress = True
        animationTimer.Start()
    End Sub

    Private Sub MaterialTextBox_LostFocus(sender As Object, e As EventArgs) Handles TRTB.LostFocus, TRTB.Leave
        TRTB.password = Password
        textMaskVisible = True
        invalidateCounter = 0
        invalidateTimer.Start()
    End Sub

    Private Sub MaterialTextBox_Click(sender As Object, e As EventArgs) Handles MyBase.Click
        TRTB.Select()
    End Sub

    Private Sub MaterialTextBox_SizeChanged(sender As Object, e As EventArgs) Handles Me.SizeChanged
        TRTB.MinimumSize = New Point(Me.Width - RectRadius - ShadowShift - 20 - _TextOffsetX + _TextPaddingRight, Me.Height)
        TRTB.MaximumSize = New Point(Me.Width - RectRadius - ShadowShift - 20 - _TextOffsetX + _TextPaddingRight, Me.Height)
        TRTB.Invalidate()
    End Sub

    'Let the Material TextBox control handle TextChanged event of the TRTB control
    Public Shadows Event TextChanged(sender As Object, e As EventArgs)
    Private Sub Mybase_TextChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles TRTB.TextChanged
        _TextCaption = TRTB.Text
        RaiseEvent TextChanged(sender, e)
    End Sub

    'Let the Material TextBox control handle KeyDowbn event of the TRTB control
    Public Shadows Event KeyDown(sender As Object, e As EventArgs)
    Private Sub Mybase_KeyDown(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles TRTB.KeyDown
        RaiseEvent KeyDown(sender, e)
    End Sub

    'Let the Material TextBox control handle PreviewKeyDowbn event of the TRTB control
    Public Shadows Event PreviewKeyDown(sender As Object, e As EventArgs)
    Private Sub Mybase_PreviewKeyDown(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles TRTB.PreviewKeyDown
        RaiseEvent PreviewKeyDown(sender, e)
    End Sub

    Public Sub SelectAll()
        TRTB.SelectAll()
    End Sub
End Class

Public Class TransparentTabControl

    Inherits TabControl

    Private pages As List(Of Panel) = New List(Of Panel)()

    Public Sub New()
        MyBase.Appearance = TabAppearance.FlatButtons
        MyBase.ItemSize = New Size(0, 1)
        MyBase.SizeMode = TabSizeMode.Fixed
    End Sub

    Public Sub makeTransparent()

        If TabCount = 0 Then Throw New InvalidOperationException()
        Dim height = GetTabRect(0).Bottom

        For tab As Integer = 0 To TabCount - 1
            Dim page = New Panel With {
                    .Left = Me.Left,
                    .Top = Me.Top + height,
                    .Width = Me.Width,
                    .Height = Me.Height - height,
                    .BackColor = Color.Transparent,
                    .Visible = tab = Me.SelectedIndex
                }

            For ix As Integer = TabPages(tab).Controls.Count - 1 To 0
                TabPages(tab).Controls(ix).Parent = page
            Next

            pages.Add(page)
            Me.Parent.Controls.Add(page)

            Dim systemType As Type = page.GetType()
            Dim propertyInfo As PropertyInfo = systemType.GetProperty("DoubleBuffered", BindingFlags.Instance Or BindingFlags.NonPublic)
            propertyInfo.SetValue(page, True, Nothing)

        Next

        Me.Height = height
    End Sub

    Protected Overrides Sub OnSelectedIndexChanged(ByVal e As EventArgs)
        MyBase.OnSelectedIndexChanged(e)

        For tab As Integer = 0 To pages.Count - 1
            pages(tab).Visible = tab = SelectedIndex
        Next
    End Sub

    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        If disposing Then

            For Each page In pages
                page.Dispose()
            Next
        End If

        MyBase.Dispose(disposing)
    End Sub
End Class

Public Class MaterialPanel

#Region "Declarations"

    Inherits Panel_DoubleBuffered
    Private G As Graphics
    Private _BackColor1 As Color
    Private _BackColor2 As Color
    Private _BorderColor As Color
    Private _OutlineColor1 As Color
    Private _OutlineColor2 As Color
    Private _BorderThickness As Integer
    Private _CornerRadius As Integer
    Private _ShadowShift As Integer
    Private _ShadowColor As Color
    Private _AccentColor As Color
    Private _AccentSize As Integer
    Private _BorderLineStyle As DashStyle

    Sub New()
        DoubleBuffered = True
        Enabled = True
        SetStyle(ControlStyles.SupportsTransparentBackColor, True)

        Me.BackColor = Color.Transparent
        Me.BackColor1 = Color.White
        Me.BackColor2 = Color.White
        Me.BorderColor = Color.White
        Me.OutlineColor1 = Color.MediumOrchid
        Me.OutlineColor2 = Color.White
        Me.CornerRadius = 15
        Me.BorderThickness = 1
        Me.ShadowShift = 10
        Me.ShadowColor = Color.Silver
        Me.AccentColor = Color.MediumOrchid
        Me.AccentSize = 12
        Me.BorderStyle = DashStyle.Solid

    End Sub

#End Region

#Region "Properties"

    <Category("Control")>
    Public Property CornerRadius As Integer
        Get
            Return _CornerRadius
        End Get
        Set(value As Integer)
            _CornerRadius = value
        End Set
    End Property

    <Category("Control")>
    Public Property BorderThickness As Integer
        Get
            Return _BorderThickness
        End Get
        Set(value As Integer)
            _BorderThickness = value
        End Set
    End Property

    <Category("Control")>
    Public Property ShadowShift As Integer
        Get
            Return _ShadowShift
        End Get
        Set(value As Integer)
            _ShadowShift = value
        End Set
    End Property

    <Category("Colours")>
    Public Property ShadowColor As Color
        Get
            Return _ShadowColor
        End Get
        Set(value As Color)
            _ShadowColor = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property BackColor1 As Color
        Get
            Return _BackColor1
        End Get
        Set(value As Color)
            _BackColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property BackColor2 As Color
        Get
            Return _BackColor2
        End Get
        Set(value As Color)
            _BackColor2 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property OutlineColor1 As Color
        Get
            Return _OutlineColor1
        End Get
        Set(value As Color)
            _OutlineColor1 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property OutlineColor2 As Color
        Get
            Return _OutlineColor2
        End Get
        Set(value As Color)
            _OutlineColor2 = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property BorderColor As Color
        Get
            Return _BorderColor
        End Get
        Set(value As Color)
            _BorderColor = value
            Invalidate()

        End Set
    End Property

    <Category("Colours")>
    Public Property AccentColor As Color
        Get
            Return _AccentColor
        End Get
        Set(value As Color)
            _AccentColor = value
            Invalidate()

        End Set
    End Property

    <Category("Control")>
    Public Property AccentSize As Integer
        Get
            Return _AccentSize
        End Get
        Set(value As Integer)
            _AccentSize = value
        End Set
    End Property

    <Category("Control")>
    Public Property BorderLineStyle As DashStyle
        Get
            Return _BorderLineStyle
        End Get
        Set(value As DashStyle)
            _BorderLineStyle = value
        End Set
    End Property

#End Region

#Region "Draw Control"

    Protected Overrides Sub OnPaint(e As PaintEventArgs)

        Try
            G = e.Graphics
            G.SmoothingMode = Drawing2D.SmoothingMode.HighQuality
            G.TextRenderingHint = Drawing.Text.TextRenderingHint.ClearTypeGridFit

            MyBase.OnPaint(e)

            'Draw the shadow
            Dim path As GraphicsPath
            Dim rect As New Rectangle
            rect = New Rectangle(ShadowShift + 10, ShadowShift + 10, Width - ShadowShift - 10, Height - ShadowShift - 10)
            path = XylosRoundRect(FullRectangle(Size, True), _CornerRadius)
            Using shadowBrush As PathGradientBrush = New PathGradientBrush(path)
                shadowBrush.CenterPoint = New PointF(rect.Width / 2, rect.Height / 2)
                shadowBrush.SurroundColors = {Color.Transparent}
                shadowBrush.CenterColor = _ShadowColor
                G.FillPath(shadowBrush, path)
                shadowBrush.FocusScales = New PointF(0.95F, 0.85F)
                G.FillPath(shadowBrush, path)
            End Using

            Dim origin As Double = _BorderThickness / 2

            'Fill Shape
            Dim gradientColor1, gradientColor2 As Color
            gradientColor1 = _BackColor1
            gradientColor2 = _BackColor2
            Using Background As New LinearGradientBrush(New Rectangle(origin, origin, Me.Width - origin, Me.Height - origin), gradientColor1, gradientColor2, LinearGradientMode.Horizontal)
                G.FillPath(Background, XylosRoundRect(New Rectangle(origin, origin, Width - ShadowShift - 1, Height - ShadowShift - origin - 1), _CornerRadius))
            End Using

            'Add Accent Color
            Using Background As New SolidBrush(_AccentColor)
                G.FillPath(Background, XylosRoundRect(New Rectangle(origin, origin, _AccentSize, Height - ShadowShift - origin - 1), _CornerRadius, RoundingStyle.Left))
            End Using

            gradientColor1 = _OutlineColor1
            gradientColor2 = _OutlineColor2
            'Draw the border
            Using Border As New Pen(New LinearGradientBrush(New Rectangle(origin, origin, Me.Width - origin - 1, Me.Height - origin - 1), gradientColor1, gradientColor2, LinearGradientMode.Horizontal), _BorderThickness)
                Border.DashStyle = _BorderLineStyle
                G.DrawPath(Border, XylosRoundRect(New Rectangle(origin, origin, Width - ShadowShift - origin - 1, Height - ShadowShift - origin - 1), _CornerRadius))
            End Using

        Catch ex As Exception
        End Try

    End Sub

#End Region

End Class