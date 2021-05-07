<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class MainForm
    Inherits System.Windows.Forms.Form

    'Form overrides dispose to clean up the component list.
    <System.Diagnostics.DebuggerNonUserCode()> _
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Required by the Windows Form Designer
    Private components As System.ComponentModel.IContainer

    'NOTE: The following procedure is required by the Windows Form Designer
    'It can be modified using the Windows Form Designer.  
    'Do not modify it using the code editor.
    <System.Diagnostics.DebuggerStepThrough()> _
    Private Sub InitializeComponent()
        Me.components = New System.ComponentModel.Container()
        Dim resources As System.ComponentModel.ComponentResourceManager = New System.ComponentModel.ComponentResourceManager(GetType(MainForm))
        Dim DataGridViewCellStyle1 As System.Windows.Forms.DataGridViewCellStyle = New System.Windows.Forms.DataGridViewCellStyle()
        Me.resizeTimer = New System.Windows.Forms.Timer(Me.components)
        Me.WindowsMediaPlayer = New AxWMPLib.AxWindowsMediaPlayer()
        Me.MainDataGridPanel = New Tuna_App.Panel_DoubleBuffered()
        Me.MainDataGrid = New System.Windows.Forms.DataGridView()
        Me.CheckBox = New System.Windows.Forms.DataGridViewCheckBoxColumn()
        Me.Index = New System.Windows.Forms.DataGridViewTextBoxColumn()
        Me.Song = New System.Windows.Forms.DataGridViewTextBoxColumn()
        Me.Artist = New System.Windows.Forms.DataGridViewTextBoxColumn()
        Me.Duration = New System.Windows.Forms.DataGridViewTextBoxColumn()
        Me.Album = New System.Windows.Forms.DataGridViewTextBoxColumn()
        Me.Genre = New System.Windows.Forms.DataGridViewTextBoxColumn()
        Me.Play_Count = New System.Windows.Forms.DataGridViewTextBoxColumn()
        Me.SelectionsPanel = New Tuna_App.Panel_DoubleBuffered()
        Me.Selections = New System.Windows.Forms.ListBox()
        Me.LeftMenuPanel = New Tuna_App.Panel_DoubleBuffered()
        Me.btn_Settings = New Tuna_App.MaterialPanel()
        Me.LabelClickThrough6 = New Tuna_App.LabelClickThrough()
        Me.btn_SyncToCloud = New Tuna_App.MaterialPanel()
        Me.LabelClickThrough5 = New Tuna_App.LabelClickThrough()
        Me.btn_ImportFile = New Tuna_App.MaterialPanel()
        Me.LabelClickThrough3 = New Tuna_App.LabelClickThrough()
        Me.btn_ExportSongs = New Tuna_App.MaterialPanel()
        Me.LabelClickThrough4 = New Tuna_App.LabelClickThrough()
        Me.btn_AddToPlaylist = New Tuna_App.MaterialPanel()
        Me.LabelClickThrough2 = New Tuna_App.LabelClickThrough()
        Me.btn_FishSongInfo = New Tuna_App.MaterialPanel()
        Me.LabelClickThrough1 = New Tuna_App.LabelClickThrough()
        Me.TopGradientPanel = New Tuna_App.GradientRectangle()
        Me.btn_close = New Tuna_App.XylosButton()
        Me.btn_maximize = New Tuna_App.XylosButton()
        Me.btn_minimize = New Tuna_App.XylosButton()
        Me.LinkSelectionAccent = New System.Windows.Forms.Panel()
        Me.Link_Genres = New System.Windows.Forms.LinkLabel()
        Me.Link_Albums = New System.Windows.Forms.LinkLabel()
        Me.Link_Artists = New System.Windows.Forms.LinkLabel()
        Me.Link_Playlists = New System.Windows.Forms.LinkLabel()
        Me.Link_Home = New System.Windows.Forms.LinkLabel()
        Me.SearchTextBox = New Tuna_App.MaterialTextBox()
        Me.BottomControlPanel = New Tuna_App.Panel_DoubleBuffered()
        Me.Playing_ArtistLabel = New System.Windows.Forms.Label()
        Me.Playing_SongLabel = New System.Windows.Forms.Label()
        Me.Playing_AlbumCover = New System.Windows.Forms.PictureBox()
        Me.SeekTimeLabel = New System.Windows.Forms.Label()
        Me.TimeRemainingLabel = New System.Windows.Forms.Label()
        Me.TimeElapsedLabel = New System.Windows.Forms.Label()
        Me.volumeSlider = New Syncfusion.Windows.Forms.Tools.TrackBarEx(0, 10)
        Me.SeekBar = New Syncfusion.Windows.Forms.Tools.TrackBarEx(0, 100)
        Me.BottomBufferPanel = New Tuna_App.Panel_DoubleBuffered()
        Me.btn_Shuffle = New Tuna_App.XylosButton()
        Me.btn_Repeat = New Tuna_App.XylosButton()
        Me.btn_Rewind = New Tuna_App.XylosButton()
        Me.btn_FastForward = New Tuna_App.XylosButton()
        Me.btn_Play = New Tuna_App.XylosButton()
        Me.leftHandlePanel = New Tuna_App.Panel_DoubleBuffered()
        Me.rightHandlePanel = New Tuna_App.Panel_DoubleBuffered()
        Me.topHandlePanel = New Tuna_App.Panel_DoubleBuffered()
        Me.bottomHandlePanel = New Tuna_App.Panel_DoubleBuffered()
        Me.PictureBox1 = New System.Windows.Forms.PictureBox()
        CType(Me.WindowsMediaPlayer, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.MainDataGridPanel.SuspendLayout()
        CType(Me.MainDataGrid, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.SelectionsPanel.SuspendLayout()
        Me.LeftMenuPanel.SuspendLayout()
        Me.btn_Settings.SuspendLayout()
        Me.btn_SyncToCloud.SuspendLayout()
        Me.btn_ImportFile.SuspendLayout()
        Me.btn_ExportSongs.SuspendLayout()
        Me.btn_AddToPlaylist.SuspendLayout()
        Me.btn_FishSongInfo.SuspendLayout()
        Me.TopGradientPanel.SuspendLayout()
        Me.BottomControlPanel.SuspendLayout()
        CType(Me.Playing_AlbumCover, System.ComponentModel.ISupportInitialize).BeginInit()
        CType(Me.PictureBox1, System.ComponentModel.ISupportInitialize).BeginInit()
        Me.SuspendLayout()
        '
        'resizeTimer
        '
        Me.resizeTimer.Interval = 10
        '
        'WindowsMediaPlayer
        '
        Me.WindowsMediaPlayer.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
        Me.WindowsMediaPlayer.Enabled = True
        Me.WindowsMediaPlayer.Location = New System.Drawing.Point(0, 600)
        Me.WindowsMediaPlayer.Name = "WindowsMediaPlayer"
        Me.WindowsMediaPlayer.OcxState = CType(resources.GetObject("WindowsMediaPlayer.OcxState"), System.Windows.Forms.AxHost.State)
        Me.WindowsMediaPlayer.Size = New System.Drawing.Size(94, 35)
        Me.WindowsMediaPlayer.TabIndex = 16
        '
        'MainDataGridPanel
        '
        Me.MainDataGridPanel.Controls.Add(Me.PictureBox1)
        Me.MainDataGridPanel.Controls.Add(Me.MainDataGrid)
        Me.MainDataGridPanel.Dock = System.Windows.Forms.DockStyle.Fill
        Me.MainDataGridPanel.ForeColor = System.Drawing.Color.FromArgb(CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer))
        Me.MainDataGridPanel.Location = New System.Drawing.Point(398, 104)
        Me.MainDataGridPanel.Name = "MainDataGridPanel"
        Me.MainDataGridPanel.Size = New System.Drawing.Size(761, 387)
        Me.MainDataGridPanel.TabIndex = 6
        '
        'MainDataGrid
        '
        Me.MainDataGrid.AllowUserToAddRows = False
        Me.MainDataGrid.AllowUserToDeleteRows = False
        Me.MainDataGrid.AllowUserToResizeRows = False
        Me.MainDataGrid.BackgroundColor = System.Drawing.Color.White
        Me.MainDataGrid.BorderStyle = System.Windows.Forms.BorderStyle.None
        Me.MainDataGrid.CellBorderStyle = System.Windows.Forms.DataGridViewCellBorderStyle.SingleHorizontal
        Me.MainDataGrid.ColumnHeadersBorderStyle = System.Windows.Forms.DataGridViewHeaderBorderStyle.None
        DataGridViewCellStyle1.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleLeft
        DataGridViewCellStyle1.BackColor = System.Drawing.Color.White
        DataGridViewCellStyle1.Font = New System.Drawing.Font("Microsoft Sans Serif", 9.0!, System.Drawing.FontStyle.Bold)
        DataGridViewCellStyle1.ForeColor = System.Drawing.Color.FromArgb(CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer))
        DataGridViewCellStyle1.SelectionBackColor = System.Drawing.Color.White
        DataGridViewCellStyle1.SelectionForeColor = System.Drawing.Color.FromArgb(CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer))
        DataGridViewCellStyle1.WrapMode = System.Windows.Forms.DataGridViewTriState.[True]
        Me.MainDataGrid.ColumnHeadersDefaultCellStyle = DataGridViewCellStyle1
        Me.MainDataGrid.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize
        Me.MainDataGrid.Columns.AddRange(New System.Windows.Forms.DataGridViewColumn() {Me.CheckBox, Me.Index, Me.Song, Me.Artist, Me.Duration, Me.Album, Me.Genre, Me.Play_Count})
        Me.MainDataGrid.Dock = System.Windows.Forms.DockStyle.Fill
        Me.MainDataGrid.EditMode = System.Windows.Forms.DataGridViewEditMode.EditProgrammatically
        Me.MainDataGrid.EnableHeadersVisualStyles = False
        Me.MainDataGrid.GridColor = System.Drawing.Color.Silver
        Me.MainDataGrid.Location = New System.Drawing.Point(0, 0)
        Me.MainDataGrid.MultiSelect = False
        Me.MainDataGrid.Name = "MainDataGrid"
        Me.MainDataGrid.ReadOnly = True
        Me.MainDataGrid.RowHeadersBorderStyle = System.Windows.Forms.DataGridViewHeaderBorderStyle.None
        Me.MainDataGrid.RowHeadersVisible = False
        Me.MainDataGrid.Size = New System.Drawing.Size(761, 387)
        Me.MainDataGrid.TabIndex = 0
        '
        'CheckBox
        '
        Me.CheckBox.Frozen = True
        Me.CheckBox.HeaderText = ""
        Me.CheckBox.Name = "CheckBox"
        Me.CheckBox.ReadOnly = True
        Me.CheckBox.Width = 30
        '
        'Index
        '
        Me.Index.HeaderText = "Index"
        Me.Index.Name = "Index"
        Me.Index.ReadOnly = True
        Me.Index.Visible = False
        Me.Index.Width = 10
        '
        'Song
        '
        Me.Song.HeaderText = "Song"
        Me.Song.Name = "Song"
        Me.Song.ReadOnly = True
        Me.Song.Width = 200
        '
        'Artist
        '
        Me.Artist.HeaderText = "Artist"
        Me.Artist.Name = "Artist"
        Me.Artist.ReadOnly = True
        Me.Artist.Width = 150
        '
        'Duration
        '
        Me.Duration.HeaderText = "Duration"
        Me.Duration.Name = "Duration"
        Me.Duration.ReadOnly = True
        Me.Duration.Width = 75
        '
        'Album
        '
        Me.Album.HeaderText = "Album"
        Me.Album.Name = "Album"
        Me.Album.ReadOnly = True
        Me.Album.Width = 150
        '
        'Genre
        '
        Me.Genre.HeaderText = "Genre"
        Me.Genre.Name = "Genre"
        Me.Genre.ReadOnly = True
        '
        'Play_Count
        '
        Me.Play_Count.HeaderText = "Play Count"
        Me.Play_Count.Name = "Play_Count"
        Me.Play_Count.ReadOnly = True
        Me.Play_Count.Width = 50
        '
        'SelectionsPanel
        '
        Me.SelectionsPanel.Controls.Add(Me.Selections)
        Me.SelectionsPanel.Dock = System.Windows.Forms.DockStyle.Left
        Me.SelectionsPanel.Font = New System.Drawing.Font("Microsoft Sans Serif", 12.0!)
        Me.SelectionsPanel.ForeColor = System.Drawing.Color.FromArgb(CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer))
        Me.SelectionsPanel.Location = New System.Drawing.Point(206, 104)
        Me.SelectionsPanel.Name = "SelectionsPanel"
        Me.SelectionsPanel.Size = New System.Drawing.Size(192, 387)
        Me.SelectionsPanel.TabIndex = 5
        '
        'Selections
        '
        Me.Selections.BackColor = System.Drawing.Color.White
        Me.Selections.BorderStyle = System.Windows.Forms.BorderStyle.None
        Me.Selections.Dock = System.Windows.Forms.DockStyle.Fill
        Me.Selections.Font = New System.Drawing.Font("Microsoft Sans Serif", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Selections.ForeColor = System.Drawing.Color.FromArgb(CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer))
        Me.Selections.FormattingEnabled = True
        Me.Selections.ItemHeight = 20
        Me.Selections.Location = New System.Drawing.Point(0, 0)
        Me.Selections.Name = "Selections"
        Me.Selections.Size = New System.Drawing.Size(192, 387)
        Me.Selections.TabIndex = 0
        '
        'LeftMenuPanel
        '
        Me.LeftMenuPanel.Controls.Add(Me.btn_Settings)
        Me.LeftMenuPanel.Controls.Add(Me.btn_SyncToCloud)
        Me.LeftMenuPanel.Controls.Add(Me.btn_ImportFile)
        Me.LeftMenuPanel.Controls.Add(Me.btn_ExportSongs)
        Me.LeftMenuPanel.Controls.Add(Me.btn_AddToPlaylist)
        Me.LeftMenuPanel.Controls.Add(Me.btn_FishSongInfo)
        Me.LeftMenuPanel.Dock = System.Windows.Forms.DockStyle.Left
        Me.LeftMenuPanel.Location = New System.Drawing.Point(2, 104)
        Me.LeftMenuPanel.Name = "LeftMenuPanel"
        Me.LeftMenuPanel.Size = New System.Drawing.Size(204, 387)
        Me.LeftMenuPanel.TabIndex = 4
        '
        'btn_Settings
        '
        Me.btn_Settings.AccentColor = System.Drawing.Color.Transparent
        Me.btn_Settings.AccentSize = 1
        Me.btn_Settings.BackColor = System.Drawing.Color.Transparent
        Me.btn_Settings.BackColor1 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(112, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.btn_Settings.BackColor2 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(127, Byte), Integer), CType(CType(203, Byte), Integer))
        Me.btn_Settings.BorderColor = System.Drawing.Color.White
        Me.btn_Settings.BorderLineStyle = System.Drawing.Drawing2D.DashStyle.Solid
        Me.btn_Settings.BorderThickness = 1
        Me.btn_Settings.Controls.Add(Me.LabelClickThrough6)
        Me.btn_Settings.CornerRadius = 15
        Me.btn_Settings.Cursor = System.Windows.Forms.Cursors.Hand
        Me.btn_Settings.Location = New System.Drawing.Point(12, 317)
        Me.btn_Settings.Name = "btn_Settings"
        Me.btn_Settings.OutlineColor1 = System.Drawing.Color.Transparent
        Me.btn_Settings.OutlineColor2 = System.Drawing.Color.Transparent
        Me.btn_Settings.ShadowColor = System.Drawing.Color.Silver
        Me.btn_Settings.ShadowShift = 5
        Me.btn_Settings.Size = New System.Drawing.Size(186, 54)
        Me.btn_Settings.TabIndex = 21
        '
        'LabelClickThrough6
        '
        Me.LabelClickThrough6.Enabled = False
        Me.LabelClickThrough6.Font = New System.Drawing.Font("Segoe UI Light", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LabelClickThrough6.FontColor = System.Drawing.Color.White
        Me.LabelClickThrough6.Location = New System.Drawing.Point(19, 1)
        Me.LabelClickThrough6.Name = "LabelClickThrough6"
        Me.LabelClickThrough6.Size = New System.Drawing.Size(149, 46)
        Me.LabelClickThrough6.TabIndex = 1
        Me.LabelClickThrough6.Text = "Settings"
        Me.LabelClickThrough6.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'btn_SyncToCloud
        '
        Me.btn_SyncToCloud.AccentColor = System.Drawing.Color.Transparent
        Me.btn_SyncToCloud.AccentSize = 1
        Me.btn_SyncToCloud.BackColor = System.Drawing.Color.Transparent
        Me.btn_SyncToCloud.BackColor1 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(112, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.btn_SyncToCloud.BackColor2 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(127, Byte), Integer), CType(CType(203, Byte), Integer))
        Me.btn_SyncToCloud.BorderColor = System.Drawing.Color.White
        Me.btn_SyncToCloud.BorderLineStyle = System.Drawing.Drawing2D.DashStyle.Solid
        Me.btn_SyncToCloud.BorderThickness = 1
        Me.btn_SyncToCloud.Controls.Add(Me.LabelClickThrough5)
        Me.btn_SyncToCloud.CornerRadius = 15
        Me.btn_SyncToCloud.Cursor = System.Windows.Forms.Cursors.Hand
        Me.btn_SyncToCloud.Location = New System.Drawing.Point(12, 257)
        Me.btn_SyncToCloud.Name = "btn_SyncToCloud"
        Me.btn_SyncToCloud.OutlineColor1 = System.Drawing.Color.Transparent
        Me.btn_SyncToCloud.OutlineColor2 = System.Drawing.Color.Transparent
        Me.btn_SyncToCloud.ShadowColor = System.Drawing.Color.Silver
        Me.btn_SyncToCloud.ShadowShift = 5
        Me.btn_SyncToCloud.Size = New System.Drawing.Size(186, 54)
        Me.btn_SyncToCloud.TabIndex = 20
        '
        'LabelClickThrough5
        '
        Me.LabelClickThrough5.Enabled = False
        Me.LabelClickThrough5.Font = New System.Drawing.Font("Segoe UI Light", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LabelClickThrough5.FontColor = System.Drawing.Color.White
        Me.LabelClickThrough5.Location = New System.Drawing.Point(19, 1)
        Me.LabelClickThrough5.Name = "LabelClickThrough5"
        Me.LabelClickThrough5.Size = New System.Drawing.Size(149, 46)
        Me.LabelClickThrough5.TabIndex = 1
        Me.LabelClickThrough5.Text = "Sync to Cloud"
        Me.LabelClickThrough5.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'btn_ImportFile
        '
        Me.btn_ImportFile.AccentColor = System.Drawing.Color.Transparent
        Me.btn_ImportFile.AccentSize = 1
        Me.btn_ImportFile.BackColor = System.Drawing.Color.Transparent
        Me.btn_ImportFile.BackColor1 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(112, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.btn_ImportFile.BackColor2 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(127, Byte), Integer), CType(CType(203, Byte), Integer))
        Me.btn_ImportFile.BorderColor = System.Drawing.Color.White
        Me.btn_ImportFile.BorderLineStyle = System.Drawing.Drawing2D.DashStyle.Solid
        Me.btn_ImportFile.BorderThickness = 1
        Me.btn_ImportFile.Controls.Add(Me.LabelClickThrough3)
        Me.btn_ImportFile.CornerRadius = 15
        Me.btn_ImportFile.Cursor = System.Windows.Forms.Cursors.Hand
        Me.btn_ImportFile.Location = New System.Drawing.Point(12, 137)
        Me.btn_ImportFile.Name = "btn_ImportFile"
        Me.btn_ImportFile.OutlineColor1 = System.Drawing.Color.Transparent
        Me.btn_ImportFile.OutlineColor2 = System.Drawing.Color.Transparent
        Me.btn_ImportFile.ShadowColor = System.Drawing.Color.Silver
        Me.btn_ImportFile.ShadowShift = 5
        Me.btn_ImportFile.Size = New System.Drawing.Size(186, 54)
        Me.btn_ImportFile.TabIndex = 18
        '
        'LabelClickThrough3
        '
        Me.LabelClickThrough3.Enabled = False
        Me.LabelClickThrough3.Font = New System.Drawing.Font("Segoe UI Light", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LabelClickThrough3.FontColor = System.Drawing.Color.White
        Me.LabelClickThrough3.Location = New System.Drawing.Point(19, 1)
        Me.LabelClickThrough3.Name = "LabelClickThrough3"
        Me.LabelClickThrough3.Size = New System.Drawing.Size(149, 46)
        Me.LabelClickThrough3.TabIndex = 1
        Me.LabelClickThrough3.Text = "Import New File"
        Me.LabelClickThrough3.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'btn_ExportSongs
        '
        Me.btn_ExportSongs.AccentColor = System.Drawing.Color.Transparent
        Me.btn_ExportSongs.AccentSize = 1
        Me.btn_ExportSongs.BackColor = System.Drawing.Color.Transparent
        Me.btn_ExportSongs.BackColor1 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(112, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.btn_ExportSongs.BackColor2 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(127, Byte), Integer), CType(CType(203, Byte), Integer))
        Me.btn_ExportSongs.BorderColor = System.Drawing.Color.White
        Me.btn_ExportSongs.BorderLineStyle = System.Drawing.Drawing2D.DashStyle.Solid
        Me.btn_ExportSongs.BorderThickness = 1
        Me.btn_ExportSongs.Controls.Add(Me.LabelClickThrough4)
        Me.btn_ExportSongs.CornerRadius = 15
        Me.btn_ExportSongs.Cursor = System.Windows.Forms.Cursors.Hand
        Me.btn_ExportSongs.Location = New System.Drawing.Point(12, 197)
        Me.btn_ExportSongs.Name = "btn_ExportSongs"
        Me.btn_ExportSongs.OutlineColor1 = System.Drawing.Color.Transparent
        Me.btn_ExportSongs.OutlineColor2 = System.Drawing.Color.Transparent
        Me.btn_ExportSongs.ShadowColor = System.Drawing.Color.Silver
        Me.btn_ExportSongs.ShadowShift = 5
        Me.btn_ExportSongs.Size = New System.Drawing.Size(186, 54)
        Me.btn_ExportSongs.TabIndex = 19
        '
        'LabelClickThrough4
        '
        Me.LabelClickThrough4.Enabled = False
        Me.LabelClickThrough4.Font = New System.Drawing.Font("Segoe UI Light", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LabelClickThrough4.FontColor = System.Drawing.Color.White
        Me.LabelClickThrough4.Location = New System.Drawing.Point(19, 1)
        Me.LabelClickThrough4.Name = "LabelClickThrough4"
        Me.LabelClickThrough4.Size = New System.Drawing.Size(149, 46)
        Me.LabelClickThrough4.TabIndex = 1
        Me.LabelClickThrough4.Text = "Export Songs"
        Me.LabelClickThrough4.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'btn_AddToPlaylist
        '
        Me.btn_AddToPlaylist.AccentColor = System.Drawing.Color.Transparent
        Me.btn_AddToPlaylist.AccentSize = 1
        Me.btn_AddToPlaylist.BackColor = System.Drawing.Color.Transparent
        Me.btn_AddToPlaylist.BackColor1 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(112, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.btn_AddToPlaylist.BackColor2 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(127, Byte), Integer), CType(CType(203, Byte), Integer))
        Me.btn_AddToPlaylist.BorderColor = System.Drawing.Color.White
        Me.btn_AddToPlaylist.BorderLineStyle = System.Drawing.Drawing2D.DashStyle.Solid
        Me.btn_AddToPlaylist.BorderThickness = 1
        Me.btn_AddToPlaylist.Controls.Add(Me.LabelClickThrough2)
        Me.btn_AddToPlaylist.CornerRadius = 15
        Me.btn_AddToPlaylist.Cursor = System.Windows.Forms.Cursors.Hand
        Me.btn_AddToPlaylist.Location = New System.Drawing.Point(12, 77)
        Me.btn_AddToPlaylist.Name = "btn_AddToPlaylist"
        Me.btn_AddToPlaylist.OutlineColor1 = System.Drawing.Color.Transparent
        Me.btn_AddToPlaylist.OutlineColor2 = System.Drawing.Color.Transparent
        Me.btn_AddToPlaylist.ShadowColor = System.Drawing.Color.Silver
        Me.btn_AddToPlaylist.ShadowShift = 5
        Me.btn_AddToPlaylist.Size = New System.Drawing.Size(186, 54)
        Me.btn_AddToPlaylist.TabIndex = 17
        '
        'LabelClickThrough2
        '
        Me.LabelClickThrough2.Enabled = False
        Me.LabelClickThrough2.Font = New System.Drawing.Font("Segoe UI Light", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LabelClickThrough2.FontColor = System.Drawing.Color.White
        Me.LabelClickThrough2.Location = New System.Drawing.Point(19, 1)
        Me.LabelClickThrough2.Name = "LabelClickThrough2"
        Me.LabelClickThrough2.Size = New System.Drawing.Size(149, 46)
        Me.LabelClickThrough2.TabIndex = 1
        Me.LabelClickThrough2.Text = "Add to Playlist"
        Me.LabelClickThrough2.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'btn_FishSongInfo
        '
        Me.btn_FishSongInfo.AccentColor = System.Drawing.Color.Transparent
        Me.btn_FishSongInfo.AccentSize = 1
        Me.btn_FishSongInfo.BackColor = System.Drawing.Color.Transparent
        Me.btn_FishSongInfo.BackColor1 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(112, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.btn_FishSongInfo.BackColor2 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(127, Byte), Integer), CType(CType(203, Byte), Integer))
        Me.btn_FishSongInfo.BorderColor = System.Drawing.Color.White
        Me.btn_FishSongInfo.BorderLineStyle = System.Drawing.Drawing2D.DashStyle.Solid
        Me.btn_FishSongInfo.BorderThickness = 1
        Me.btn_FishSongInfo.Controls.Add(Me.LabelClickThrough1)
        Me.btn_FishSongInfo.CornerRadius = 15
        Me.btn_FishSongInfo.Cursor = System.Windows.Forms.Cursors.Hand
        Me.btn_FishSongInfo.Location = New System.Drawing.Point(12, 17)
        Me.btn_FishSongInfo.Name = "btn_FishSongInfo"
        Me.btn_FishSongInfo.OutlineColor1 = System.Drawing.Color.Transparent
        Me.btn_FishSongInfo.OutlineColor2 = System.Drawing.Color.Transparent
        Me.btn_FishSongInfo.ShadowColor = System.Drawing.Color.Silver
        Me.btn_FishSongInfo.ShadowShift = 5
        Me.btn_FishSongInfo.Size = New System.Drawing.Size(186, 54)
        Me.btn_FishSongInfo.TabIndex = 16
        '
        'LabelClickThrough1
        '
        Me.LabelClickThrough1.Enabled = False
        Me.LabelClickThrough1.Font = New System.Drawing.Font("Segoe UI Light", 12.0!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.LabelClickThrough1.FontColor = System.Drawing.Color.White
        Me.LabelClickThrough1.Location = New System.Drawing.Point(17, 1)
        Me.LabelClickThrough1.Name = "LabelClickThrough1"
        Me.LabelClickThrough1.Size = New System.Drawing.Size(149, 46)
        Me.LabelClickThrough1.TabIndex = 0
        Me.LabelClickThrough1.Text = "Fish for Song Info"
        Me.LabelClickThrough1.TextAlign = System.Drawing.ContentAlignment.MiddleLeft
        '
        'TopGradientPanel
        '
        Me.TopGradientPanel.BackgroundImage = CType(resources.GetObject("TopGradientPanel.BackgroundImage"), System.Drawing.Image)
        Me.TopGradientPanel.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch
        Me.TopGradientPanel.Color1 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(112, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.TopGradientPanel.Color2 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(113, Byte), Integer), CType(CType(193, Byte), Integer))
        Me.TopGradientPanel.Color3 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(176, Byte), Integer), CType(CType(240, Byte), Integer))
        Me.TopGradientPanel.Color4 = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(176, Byte), Integer), CType(CType(240, Byte), Integer))
        Me.TopGradientPanel.Controls.Add(Me.btn_close)
        Me.TopGradientPanel.Controls.Add(Me.btn_maximize)
        Me.TopGradientPanel.Controls.Add(Me.btn_minimize)
        Me.TopGradientPanel.Controls.Add(Me.LinkSelectionAccent)
        Me.TopGradientPanel.Controls.Add(Me.Link_Genres)
        Me.TopGradientPanel.Controls.Add(Me.Link_Albums)
        Me.TopGradientPanel.Controls.Add(Me.Link_Artists)
        Me.TopGradientPanel.Controls.Add(Me.Link_Playlists)
        Me.TopGradientPanel.Controls.Add(Me.Link_Home)
        Me.TopGradientPanel.Controls.Add(Me.SearchTextBox)
        Me.TopGradientPanel.Dock = System.Windows.Forms.DockStyle.Top
        Me.TopGradientPanel.Location = New System.Drawing.Point(2, 2)
        Me.TopGradientPanel.Name = "TopGradientPanel"
        Me.TopGradientPanel.Size = New System.Drawing.Size(1157, 102)
        Me.TopGradientPanel.TabIndex = 3
        '
        'btn_close
        '
        Me.btn_close.Anchor = CType((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.btn_close.BackColor = System.Drawing.Color.Transparent
        Me.btn_close.BackColor1 = System.Drawing.Color.FromArgb(CType(CType(100, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_close.BackColor2 = System.Drawing.Color.FromArgb(CType(CType(100, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_close.BorderColor = System.Drawing.Color.Transparent
        Me.btn_close.BorderThickness = 0
        Me.btn_close.CornerRadius = 0
        Me.btn_close.CornerRoundingStyle = Tuna_App.Helpers.RoundingStyle.All
        Me.btn_close.EnabledCalc = True
        Me.btn_close.Font1 = New System.Drawing.Font("Arial", 9.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btn_close.ForeColor1 = System.Drawing.Color.White
        Me.btn_close.Location = New System.Drawing.Point(1106, 3)
        Me.btn_close.MouseDownColor1 = System.Drawing.Color.FromArgb(CType(CType(100, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_close.MouseDownColor2 = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_close.MouseEnterTransitionTime = 150
        Me.btn_close.MouseLeaveTransitionTime = 150
        Me.btn_close.MouseOverColor1 = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_close.MouseOverColor2 = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_close.Name = "btn_close"
        Me.btn_close.OutlineColor1 = System.Drawing.Color.FromArgb(CType(CType(200, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_close.OutlineColor2 = System.Drawing.Color.FromArgb(CType(CType(200, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_close.Size = New System.Drawing.Size(47, 23)
        Me.btn_close.TabIndex = 9
        Me.btn_close.Text = "X"
        '
        'btn_maximize
        '
        Me.btn_maximize.Anchor = CType((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.btn_maximize.BackColor = System.Drawing.Color.Transparent
        Me.btn_maximize.BackColor1 = System.Drawing.Color.FromArgb(CType(CType(100, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_maximize.BackColor2 = System.Drawing.Color.FromArgb(CType(CType(100, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_maximize.BorderColor = System.Drawing.Color.Transparent
        Me.btn_maximize.BorderThickness = 0
        Me.btn_maximize.CornerRadius = 0
        Me.btn_maximize.CornerRoundingStyle = Tuna_App.Helpers.RoundingStyle.All
        Me.btn_maximize.EnabledCalc = True
        Me.btn_maximize.Font1 = New System.Drawing.Font("Arial", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btn_maximize.ForeColor1 = System.Drawing.Color.White
        Me.btn_maximize.Location = New System.Drawing.Point(1053, 3)
        Me.btn_maximize.MouseDownColor1 = System.Drawing.Color.FromArgb(CType(CType(100, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_maximize.MouseDownColor2 = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_maximize.MouseEnterTransitionTime = 150
        Me.btn_maximize.MouseLeaveTransitionTime = 150
        Me.btn_maximize.MouseOverColor1 = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_maximize.MouseOverColor2 = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_maximize.Name = "btn_maximize"
        Me.btn_maximize.OutlineColor1 = System.Drawing.Color.FromArgb(CType(CType(200, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_maximize.OutlineColor2 = System.Drawing.Color.FromArgb(CType(CType(200, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_maximize.Size = New System.Drawing.Size(47, 23)
        Me.btn_maximize.TabIndex = 8
        Me.btn_maximize.Text = "❒"
        '
        'btn_minimize
        '
        Me.btn_minimize.Anchor = CType((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.btn_minimize.BackColor = System.Drawing.Color.Transparent
        Me.btn_minimize.BackColor1 = System.Drawing.Color.FromArgb(CType(CType(100, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_minimize.BackColor2 = System.Drawing.Color.FromArgb(CType(CType(100, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_minimize.BorderColor = System.Drawing.Color.Transparent
        Me.btn_minimize.BorderThickness = 0
        Me.btn_minimize.CornerRadius = 0
        Me.btn_minimize.CornerRoundingStyle = Tuna_App.Helpers.RoundingStyle.All
        Me.btn_minimize.EnabledCalc = True
        Me.btn_minimize.Font1 = New System.Drawing.Font("Arial", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btn_minimize.ForeColor1 = System.Drawing.Color.White
        Me.btn_minimize.Location = New System.Drawing.Point(1000, 3)
        Me.btn_minimize.MouseDownColor1 = System.Drawing.Color.FromArgb(CType(CType(100, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_minimize.MouseDownColor2 = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_minimize.MouseEnterTransitionTime = 150
        Me.btn_minimize.MouseLeaveTransitionTime = 150
        Me.btn_minimize.MouseOverColor1 = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_minimize.MouseOverColor2 = System.Drawing.Color.FromArgb(CType(CType(50, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_minimize.Name = "btn_minimize"
        Me.btn_minimize.OutlineColor1 = System.Drawing.Color.FromArgb(CType(CType(200, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_minimize.OutlineColor2 = System.Drawing.Color.FromArgb(CType(CType(200, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer), CType(CType(255, Byte), Integer))
        Me.btn_minimize.Size = New System.Drawing.Size(47, 23)
        Me.btn_minimize.TabIndex = 7
        Me.btn_minimize.Text = "▬"
        '
        'LinkSelectionAccent
        '
        Me.LinkSelectionAccent.BackColor = System.Drawing.Color.LightGray
        Me.LinkSelectionAccent.Location = New System.Drawing.Point(14, 93)
        Me.LinkSelectionAccent.Name = "LinkSelectionAccent"
        Me.LinkSelectionAccent.Size = New System.Drawing.Size(84, 5)
        Me.LinkSelectionAccent.TabIndex = 6
        '
        'Link_Genres
        '
        Me.Link_Genres.ActiveLinkColor = System.Drawing.Color.White
        Me.Link_Genres.AutoSize = True
        Me.Link_Genres.BackColor = System.Drawing.Color.Transparent
        Me.Link_Genres.Font = New System.Drawing.Font("Segoe UI Light", 20.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Link_Genres.LinkBehavior = System.Windows.Forms.LinkBehavior.NeverUnderline
        Me.Link_Genres.LinkColor = System.Drawing.Color.White
        Me.Link_Genres.Location = New System.Drawing.Point(428, 53)
        Me.Link_Genres.Name = "Link_Genres"
        Me.Link_Genres.Size = New System.Drawing.Size(95, 37)
        Me.Link_Genres.TabIndex = 5
        Me.Link_Genres.TabStop = True
        Me.Link_Genres.Text = "Genres"
        Me.Link_Genres.VisitedLinkColor = System.Drawing.Color.White
        '
        'Link_Albums
        '
        Me.Link_Albums.ActiveLinkColor = System.Drawing.Color.White
        Me.Link_Albums.AutoSize = True
        Me.Link_Albums.BackColor = System.Drawing.Color.Transparent
        Me.Link_Albums.Font = New System.Drawing.Font("Segoe UI Light", 20.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Link_Albums.LinkBehavior = System.Windows.Forms.LinkBehavior.NeverUnderline
        Me.Link_Albums.LinkColor = System.Drawing.Color.White
        Me.Link_Albums.Location = New System.Drawing.Point(317, 53)
        Me.Link_Albums.Name = "Link_Albums"
        Me.Link_Albums.Size = New System.Drawing.Size(101, 37)
        Me.Link_Albums.TabIndex = 4
        Me.Link_Albums.TabStop = True
        Me.Link_Albums.Text = "Albums"
        Me.Link_Albums.VisitedLinkColor = System.Drawing.Color.White
        '
        'Link_Artists
        '
        Me.Link_Artists.ActiveLinkColor = System.Drawing.Color.White
        Me.Link_Artists.AutoSize = True
        Me.Link_Artists.BackColor = System.Drawing.Color.Transparent
        Me.Link_Artists.Font = New System.Drawing.Font("Segoe UI Light", 20.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Link_Artists.LinkBehavior = System.Windows.Forms.LinkBehavior.NeverUnderline
        Me.Link_Artists.LinkColor = System.Drawing.Color.White
        Me.Link_Artists.Location = New System.Drawing.Point(221, 53)
        Me.Link_Artists.Name = "Link_Artists"
        Me.Link_Artists.Size = New System.Drawing.Size(86, 37)
        Me.Link_Artists.TabIndex = 3
        Me.Link_Artists.TabStop = True
        Me.Link_Artists.Text = "Artists"
        Me.Link_Artists.VisitedLinkColor = System.Drawing.Color.White
        '
        'Link_Playlists
        '
        Me.Link_Playlists.ActiveLinkColor = System.Drawing.Color.White
        Me.Link_Playlists.AutoSize = True
        Me.Link_Playlists.BackColor = System.Drawing.Color.Transparent
        Me.Link_Playlists.Font = New System.Drawing.Font("Segoe UI Light", 20.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Link_Playlists.LinkBehavior = System.Windows.Forms.LinkBehavior.NeverUnderline
        Me.Link_Playlists.LinkColor = System.Drawing.Color.White
        Me.Link_Playlists.Location = New System.Drawing.Point(108, 53)
        Me.Link_Playlists.Name = "Link_Playlists"
        Me.Link_Playlists.Size = New System.Drawing.Size(103, 37)
        Me.Link_Playlists.TabIndex = 2
        Me.Link_Playlists.TabStop = True
        Me.Link_Playlists.Text = "Playlists"
        Me.Link_Playlists.VisitedLinkColor = System.Drawing.Color.White
        '
        'Link_Home
        '
        Me.Link_Home.ActiveLinkColor = System.Drawing.Color.White
        Me.Link_Home.AutoSize = True
        Me.Link_Home.BackColor = System.Drawing.Color.Transparent
        Me.Link_Home.Font = New System.Drawing.Font("Segoe UI Light", 20.25!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.Link_Home.LinkBehavior = System.Windows.Forms.LinkBehavior.NeverUnderline
        Me.Link_Home.LinkColor = System.Drawing.Color.White
        Me.Link_Home.Location = New System.Drawing.Point(12, 53)
        Me.Link_Home.Name = "Link_Home"
        Me.Link_Home.Size = New System.Drawing.Size(86, 37)
        Me.Link_Home.TabIndex = 1
        Me.Link_Home.TabStop = True
        Me.Link_Home.Text = "Home"
        Me.Link_Home.VisitedLinkColor = System.Drawing.Color.White
        '
        'SearchTextBox
        '
        Me.SearchTextBox.Anchor = System.Windows.Forms.AnchorStyles.Top
        Me.SearchTextBox.AnimationSpeed = 10
        Me.SearchTextBox.BackColor = System.Drawing.Color.Transparent
        Me.SearchTextBox.BackgroundGradientMode = BevelPanel.AdvancedPanel.PanelGradientMode.Vertical
        Me.SearchTextBox.EdgeWidth = 2
        Me.SearchTextBox.EndColor = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(112, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.SearchTextBox.FlatBorderColor = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(112, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.SearchTextBox.Font = New System.Drawing.Font("Segoe UI Light", 12.25!)
        Me.SearchTextBox.FontColor = System.Drawing.Color.White
        Me.SearchTextBox.ForeColor = System.Drawing.Color.White
        Me.SearchTextBox.Location = New System.Drawing.Point(362, 8)
        Me.SearchTextBox.MaxCharacters = 9999
        Me.SearchTextBox.Name = "SearchTextBox"
        Me.SearchTextBox.Password = False
        Me.SearchTextBox.RectRadius = 7
        Me.SearchTextBox.ShadowColor = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(98, Byte), Integer), CType(CType(146, Byte), Integer))
        Me.SearchTextBox.ShadowShift = 4
        Me.SearchTextBox.ShadowStyle = BevelPanel.AdvancedPanel.ShadowMode.ForwardDiagonal
        Me.SearchTextBox.Size = New System.Drawing.Size(433, 36)
        Me.SearchTextBox.StartColor = System.Drawing.Color.FromArgb(CType(CType(0, Byte), Integer), CType(CType(112, Byte), Integer), CType(CType(192, Byte), Integer))
        Me.SearchTextBox.Style = BevelPanel.AdvancedPanel.BevelStyle.Flat
        Me.SearchTextBox.TabIndex = 0
        Me.SearchTextBox.TextCaption = ""
        Me.SearchTextBox.TextMask = "Search..."
        Me.SearchTextBox.TextMaskColor = System.Drawing.Color.Silver
        Me.SearchTextBox.TextOffsetX = 0
        Me.SearchTextBox.TextOffsetY = -15
        Me.SearchTextBox.TextPaddingRight = 0
        Me.SearchTextBox.UnderlineColor = System.Drawing.Color.Silver
        Me.SearchTextBox.UnderlineOffsetLeft = 14
        Me.SearchTextBox.UnderlineOffsetRight = -2
        Me.SearchTextBox.UnderlineStatic = False
        Me.SearchTextBox.UnderlineStaticColor = System.Drawing.Color.Gainsboro
        Me.SearchTextBox.UnderlineThickness = 1
        '
        'BottomControlPanel
        '
        Me.BottomControlPanel.Controls.Add(Me.Playing_ArtistLabel)
        Me.BottomControlPanel.Controls.Add(Me.Playing_SongLabel)
        Me.BottomControlPanel.Controls.Add(Me.Playing_AlbumCover)
        Me.BottomControlPanel.Controls.Add(Me.SeekTimeLabel)
        Me.BottomControlPanel.Controls.Add(Me.TimeRemainingLabel)
        Me.BottomControlPanel.Controls.Add(Me.TimeElapsedLabel)
        Me.BottomControlPanel.Controls.Add(Me.volumeSlider)
        Me.BottomControlPanel.Controls.Add(Me.SeekBar)
        Me.BottomControlPanel.Controls.Add(Me.BottomBufferPanel)
        Me.BottomControlPanel.Controls.Add(Me.btn_Shuffle)
        Me.BottomControlPanel.Controls.Add(Me.btn_Repeat)
        Me.BottomControlPanel.Controls.Add(Me.btn_Rewind)
        Me.BottomControlPanel.Controls.Add(Me.btn_FastForward)
        Me.BottomControlPanel.Controls.Add(Me.btn_Play)
        Me.BottomControlPanel.Dock = System.Windows.Forms.DockStyle.Bottom
        Me.BottomControlPanel.Location = New System.Drawing.Point(2, 491)
        Me.BottomControlPanel.Name = "BottomControlPanel"
        Me.BottomControlPanel.Size = New System.Drawing.Size(1157, 100)
        Me.BottomControlPanel.TabIndex = 2
        '
        'Playing_ArtistLabel
        '
        Me.Playing_ArtistLabel.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
        Me.Playing_ArtistLabel.AutoEllipsis = True
        Me.Playing_ArtistLabel.Font = New System.Drawing.Font("Calibri", 10.25!, System.Drawing.FontStyle.Bold)
        Me.Playing_ArtistLabel.Location = New System.Drawing.Point(59, 71)
        Me.Playing_ArtistLabel.Name = "Playing_ArtistLabel"
        Me.Playing_ArtistLabel.Size = New System.Drawing.Size(248, 23)
        Me.Playing_ArtistLabel.TabIndex = 14
        Me.Playing_ArtistLabel.Text = "Artist Name"
        '
        'Playing_SongLabel
        '
        Me.Playing_SongLabel.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
        Me.Playing_SongLabel.AutoEllipsis = True
        Me.Playing_SongLabel.Font = New System.Drawing.Font("Calibri", 14.25!)
        Me.Playing_SongLabel.Location = New System.Drawing.Point(58, 46)
        Me.Playing_SongLabel.Name = "Playing_SongLabel"
        Me.Playing_SongLabel.Size = New System.Drawing.Size(249, 25)
        Me.Playing_SongLabel.TabIndex = 13
        Me.Playing_SongLabel.Text = "Song Name"
        '
        'Playing_AlbumCover
        '
        Me.Playing_AlbumCover.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
        Me.Playing_AlbumCover.BackColor = System.Drawing.Color.DarkGray
        Me.Playing_AlbumCover.Location = New System.Drawing.Point(3, 46)
        Me.Playing_AlbumCover.Name = "Playing_AlbumCover"
        Me.Playing_AlbumCover.Size = New System.Drawing.Size(50, 50)
        Me.Playing_AlbumCover.TabIndex = 12
        Me.Playing_AlbumCover.TabStop = False
        '
        'SeekTimeLabel
        '
        Me.SeekTimeLabel.AutoSize = True
        Me.SeekTimeLabel.Location = New System.Drawing.Point(565, 30)
        Me.SeekTimeLabel.Name = "SeekTimeLabel"
        Me.SeekTimeLabel.Size = New System.Drawing.Size(34, 13)
        Me.SeekTimeLabel.TabIndex = 11
        Me.SeekTimeLabel.Text = "00:00"
        '
        'TimeRemainingLabel
        '
        Me.TimeRemainingLabel.Anchor = CType((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.TimeRemainingLabel.AutoSize = True
        Me.TimeRemainingLabel.Location = New System.Drawing.Point(1111, 30)
        Me.TimeRemainingLabel.Name = "TimeRemainingLabel"
        Me.TimeRemainingLabel.Size = New System.Drawing.Size(34, 13)
        Me.TimeRemainingLabel.TabIndex = 10
        Me.TimeRemainingLabel.Text = "00:00"
        '
        'TimeElapsedLabel
        '
        Me.TimeElapsedLabel.AutoSize = True
        Me.TimeElapsedLabel.Location = New System.Drawing.Point(11, 30)
        Me.TimeElapsedLabel.Name = "TimeElapsedLabel"
        Me.TimeElapsedLabel.Size = New System.Drawing.Size(34, 13)
        Me.TimeElapsedLabel.TabIndex = 7
        Me.TimeElapsedLabel.Text = "00:00"
        '
        'volumeSlider
        '
        Me.volumeSlider.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
        Me.volumeSlider.BackColor = System.Drawing.Color.White
        Me.volumeSlider.BeforeTouchSize = New System.Drawing.Size(191, 20)
        Me.volumeSlider.DecreaseButtonSize = New System.Drawing.Size(0, 0)
        Me.volumeSlider.IncreaseButtonSize = New System.Drawing.Size(0, 0)
        Me.volumeSlider.Location = New System.Drawing.Point(954, 68)
        Me.volumeSlider.Name = "volumeSlider"
        Me.volumeSlider.ShowButtons = False
        Me.volumeSlider.ShowFocusRect = False
        Me.volumeSlider.Size = New System.Drawing.Size(191, 20)
        Me.volumeSlider.SliderSize = New System.Drawing.Size(15, 15)
        Me.volumeSlider.Style = Syncfusion.Windows.Forms.Tools.TrackBarEx.Theme.Metro
        Me.volumeSlider.TabIndex = 9
        Me.volumeSlider.Text = "TrackBarEx2"
        Me.volumeSlider.ThemeName = "Metro"
        Me.volumeSlider.TimerInterval = 100
        Me.volumeSlider.Value = 5
        '
        'SeekBar
        '
        Me.SeekBar.BackColor = System.Drawing.Color.White
        Me.SeekBar.BeforeTouchSize = New System.Drawing.Size(1157, 20)
        Me.SeekBar.DecreaseButtonSize = New System.Drawing.Size(0, 0)
        Me.SeekBar.Dock = System.Windows.Forms.DockStyle.Top
        Me.SeekBar.IncreaseButtonSize = New System.Drawing.Size(0, 0)
        Me.SeekBar.Location = New System.Drawing.Point(0, 10)
        Me.SeekBar.Name = "SeekBar"
        Me.SeekBar.ShowButtons = False
        Me.SeekBar.ShowFocusRect = False
        Me.SeekBar.Size = New System.Drawing.Size(1157, 20)
        Me.SeekBar.SliderSize = New System.Drawing.Size(15, 15)
        Me.SeekBar.Style = Syncfusion.Windows.Forms.Tools.TrackBarEx.Theme.Metro
        Me.SeekBar.TabIndex = 8
        Me.SeekBar.Text = "TrackBarEx1"
        Me.SeekBar.ThemeName = "Metro"
        Me.SeekBar.TimerInterval = 100
        Me.SeekBar.Value = 50
        '
        'BottomBufferPanel
        '
        Me.BottomBufferPanel.Dock = System.Windows.Forms.DockStyle.Top
        Me.BottomBufferPanel.Location = New System.Drawing.Point(0, 0)
        Me.BottomBufferPanel.Name = "BottomBufferPanel"
        Me.BottomBufferPanel.Size = New System.Drawing.Size(1157, 10)
        Me.BottomBufferPanel.TabIndex = 15
        '
        'btn_Shuffle
        '
        Me.btn_Shuffle.Anchor = System.Windows.Forms.AnchorStyles.Bottom
        Me.btn_Shuffle.BackColor = System.Drawing.Color.Transparent
        Me.btn_Shuffle.BackColor1 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Shuffle.BackColor2 = System.Drawing.Color.DodgerBlue
        Me.btn_Shuffle.BorderColor = System.Drawing.Color.White
        Me.btn_Shuffle.BorderThickness = 1
        Me.btn_Shuffle.CornerRadius = 15
        Me.btn_Shuffle.CornerRoundingStyle = Tuna_App.Helpers.RoundingStyle.All
        Me.btn_Shuffle.EnabledCalc = True
        Me.btn_Shuffle.Font1 = New System.Drawing.Font("Tahoma", 15.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btn_Shuffle.ForeColor1 = System.Drawing.Color.White
        Me.btn_Shuffle.Location = New System.Drawing.Point(694, 55)
        Me.btn_Shuffle.MouseDownColor1 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Shuffle.MouseDownColor2 = System.Drawing.Color.DodgerBlue
        Me.btn_Shuffle.MouseEnterTransitionTime = 150
        Me.btn_Shuffle.MouseLeaveTransitionTime = 150
        Me.btn_Shuffle.MouseOverColor1 = System.Drawing.Color.DodgerBlue
        Me.btn_Shuffle.MouseOverColor2 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Shuffle.Name = "btn_Shuffle"
        Me.btn_Shuffle.OutlineColor1 = System.Drawing.Color.White
        Me.btn_Shuffle.OutlineColor2 = System.Drawing.Color.White
        Me.btn_Shuffle.Size = New System.Drawing.Size(53, 33)
        Me.btn_Shuffle.TabIndex = 5
        Me.btn_Shuffle.Text = "⇄"
        '
        'btn_Repeat
        '
        Me.btn_Repeat.Anchor = System.Windows.Forms.AnchorStyles.Bottom
        Me.btn_Repeat.BackColor = System.Drawing.Color.Transparent
        Me.btn_Repeat.BackColor1 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Repeat.BackColor2 = System.Drawing.Color.DodgerBlue
        Me.btn_Repeat.BorderColor = System.Drawing.Color.White
        Me.btn_Repeat.BorderThickness = 1
        Me.btn_Repeat.CornerRadius = 15
        Me.btn_Repeat.CornerRoundingStyle = Tuna_App.Helpers.RoundingStyle.All
        Me.btn_Repeat.EnabledCalc = True
        Me.btn_Repeat.Font1 = New System.Drawing.Font("Tahoma", 15.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btn_Repeat.ForeColor1 = System.Drawing.Color.White
        Me.btn_Repeat.Location = New System.Drawing.Point(418, 55)
        Me.btn_Repeat.MouseDownColor1 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Repeat.MouseDownColor2 = System.Drawing.Color.DodgerBlue
        Me.btn_Repeat.MouseEnterTransitionTime = 150
        Me.btn_Repeat.MouseLeaveTransitionTime = 150
        Me.btn_Repeat.MouseOverColor1 = System.Drawing.Color.DodgerBlue
        Me.btn_Repeat.MouseOverColor2 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Repeat.Name = "btn_Repeat"
        Me.btn_Repeat.OutlineColor1 = System.Drawing.Color.White
        Me.btn_Repeat.OutlineColor2 = System.Drawing.Color.White
        Me.btn_Repeat.Size = New System.Drawing.Size(53, 33)
        Me.btn_Repeat.TabIndex = 4
        Me.btn_Repeat.Text = "↺"
        '
        'btn_Rewind
        '
        Me.btn_Rewind.Anchor = System.Windows.Forms.AnchorStyles.Bottom
        Me.btn_Rewind.BackColor = System.Drawing.Color.Transparent
        Me.btn_Rewind.BackColor1 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Rewind.BackColor2 = System.Drawing.Color.DodgerBlue
        Me.btn_Rewind.BorderColor = System.Drawing.Color.White
        Me.btn_Rewind.BorderThickness = 1
        Me.btn_Rewind.CornerRadius = 15
        Me.btn_Rewind.CornerRoundingStyle = Tuna_App.Helpers.RoundingStyle.All
        Me.btn_Rewind.EnabledCalc = True
        Me.btn_Rewind.Font1 = New System.Drawing.Font("Tahoma", 15.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btn_Rewind.ForeColor1 = System.Drawing.Color.White
        Me.btn_Rewind.Location = New System.Drawing.Point(487, 55)
        Me.btn_Rewind.MouseDownColor1 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Rewind.MouseDownColor2 = System.Drawing.Color.DodgerBlue
        Me.btn_Rewind.MouseEnterTransitionTime = 150
        Me.btn_Rewind.MouseLeaveTransitionTime = 150
        Me.btn_Rewind.MouseOverColor1 = System.Drawing.Color.DodgerBlue
        Me.btn_Rewind.MouseOverColor2 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Rewind.Name = "btn_Rewind"
        Me.btn_Rewind.OutlineColor1 = System.Drawing.Color.White
        Me.btn_Rewind.OutlineColor2 = System.Drawing.Color.White
        Me.btn_Rewind.Size = New System.Drawing.Size(53, 33)
        Me.btn_Rewind.TabIndex = 3
        Me.btn_Rewind.Text = "⏪"
        '
        'btn_FastForward
        '
        Me.btn_FastForward.Anchor = System.Windows.Forms.AnchorStyles.Bottom
        Me.btn_FastForward.BackColor = System.Drawing.Color.Transparent
        Me.btn_FastForward.BackColor1 = System.Drawing.Color.DeepSkyBlue
        Me.btn_FastForward.BackColor2 = System.Drawing.Color.DodgerBlue
        Me.btn_FastForward.BorderColor = System.Drawing.Color.White
        Me.btn_FastForward.BorderThickness = 1
        Me.btn_FastForward.CornerRadius = 15
        Me.btn_FastForward.CornerRoundingStyle = Tuna_App.Helpers.RoundingStyle.All
        Me.btn_FastForward.EnabledCalc = True
        Me.btn_FastForward.Font1 = New System.Drawing.Font("Tahoma", 15.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btn_FastForward.ForeColor1 = System.Drawing.Color.White
        Me.btn_FastForward.Location = New System.Drawing.Point(625, 55)
        Me.btn_FastForward.MouseDownColor1 = System.Drawing.Color.DeepSkyBlue
        Me.btn_FastForward.MouseDownColor2 = System.Drawing.Color.DodgerBlue
        Me.btn_FastForward.MouseEnterTransitionTime = 150
        Me.btn_FastForward.MouseLeaveTransitionTime = 150
        Me.btn_FastForward.MouseOverColor1 = System.Drawing.Color.DodgerBlue
        Me.btn_FastForward.MouseOverColor2 = System.Drawing.Color.DeepSkyBlue
        Me.btn_FastForward.Name = "btn_FastForward"
        Me.btn_FastForward.OutlineColor1 = System.Drawing.Color.White
        Me.btn_FastForward.OutlineColor2 = System.Drawing.Color.White
        Me.btn_FastForward.Size = New System.Drawing.Size(53, 33)
        Me.btn_FastForward.TabIndex = 2
        Me.btn_FastForward.Text = "⏩"
        '
        'btn_Play
        '
        Me.btn_Play.Anchor = System.Windows.Forms.AnchorStyles.Bottom
        Me.btn_Play.BackColor = System.Drawing.Color.Transparent
        Me.btn_Play.BackColor1 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Play.BackColor2 = System.Drawing.Color.DodgerBlue
        Me.btn_Play.BorderColor = System.Drawing.Color.White
        Me.btn_Play.BorderThickness = 1
        Me.btn_Play.CornerRadius = 15
        Me.btn_Play.CornerRoundingStyle = Tuna_App.Helpers.RoundingStyle.All
        Me.btn_Play.EnabledCalc = True
        Me.btn_Play.Font1 = New System.Drawing.Font("Tahoma", 15.75!, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
        Me.btn_Play.ForeColor1 = System.Drawing.Color.White
        Me.btn_Play.Location = New System.Drawing.Point(556, 55)
        Me.btn_Play.MouseDownColor1 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Play.MouseDownColor2 = System.Drawing.Color.DodgerBlue
        Me.btn_Play.MouseEnterTransitionTime = 150
        Me.btn_Play.MouseLeaveTransitionTime = 150
        Me.btn_Play.MouseOverColor1 = System.Drawing.Color.DodgerBlue
        Me.btn_Play.MouseOverColor2 = System.Drawing.Color.DeepSkyBlue
        Me.btn_Play.Name = "btn_Play"
        Me.btn_Play.OutlineColor1 = System.Drawing.Color.White
        Me.btn_Play.OutlineColor2 = System.Drawing.Color.White
        Me.btn_Play.Size = New System.Drawing.Size(53, 33)
        Me.btn_Play.TabIndex = 1
        Me.btn_Play.Text = "►"
        '
        'leftHandlePanel
        '
        Me.leftHandlePanel.BackColor = System.Drawing.Color.FromArgb(CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer))
        Me.leftHandlePanel.Dock = System.Windows.Forms.DockStyle.Left
        Me.leftHandlePanel.Location = New System.Drawing.Point(0, 2)
        Me.leftHandlePanel.Name = "leftHandlePanel"
        Me.leftHandlePanel.Size = New System.Drawing.Size(2, 589)
        Me.leftHandlePanel.TabIndex = 1
        '
        'rightHandlePanel
        '
        Me.rightHandlePanel.BackColor = System.Drawing.Color.FromArgb(CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer))
        Me.rightHandlePanel.Dock = System.Windows.Forms.DockStyle.Right
        Me.rightHandlePanel.Location = New System.Drawing.Point(1159, 2)
        Me.rightHandlePanel.Name = "rightHandlePanel"
        Me.rightHandlePanel.Size = New System.Drawing.Size(2, 589)
        Me.rightHandlePanel.TabIndex = 2
        '
        'topHandlePanel
        '
        Me.topHandlePanel.BackColor = System.Drawing.Color.FromArgb(CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer))
        Me.topHandlePanel.Dock = System.Windows.Forms.DockStyle.Top
        Me.topHandlePanel.Location = New System.Drawing.Point(0, 0)
        Me.topHandlePanel.Name = "topHandlePanel"
        Me.topHandlePanel.Size = New System.Drawing.Size(1161, 2)
        Me.topHandlePanel.TabIndex = 3
        '
        'bottomHandlePanel
        '
        Me.bottomHandlePanel.BackColor = System.Drawing.Color.FromArgb(CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer), CType(CType(30, Byte), Integer))
        Me.bottomHandlePanel.Dock = System.Windows.Forms.DockStyle.Bottom
        Me.bottomHandlePanel.Location = New System.Drawing.Point(0, 591)
        Me.bottomHandlePanel.Name = "bottomHandlePanel"
        Me.bottomHandlePanel.Size = New System.Drawing.Size(1161, 2)
        Me.bottomHandlePanel.TabIndex = 3
        '
        'PictureBox1
        '
        Me.PictureBox1.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Zoom
        Me.PictureBox1.Location = New System.Drawing.Point(172, 100)
        Me.PictureBox1.Name = "PictureBox1"
        Me.PictureBox1.Size = New System.Drawing.Size(275, 223)
        Me.PictureBox1.TabIndex = 1
        Me.PictureBox1.TabStop = False
        '
        'MainForm
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.BackColor = System.Drawing.Color.White
        Me.ClientSize = New System.Drawing.Size(1161, 593)
        Me.Controls.Add(Me.WindowsMediaPlayer)
        Me.Controls.Add(Me.MainDataGridPanel)
        Me.Controls.Add(Me.SelectionsPanel)
        Me.Controls.Add(Me.LeftMenuPanel)
        Me.Controls.Add(Me.TopGradientPanel)
        Me.Controls.Add(Me.BottomControlPanel)
        Me.Controls.Add(Me.leftHandlePanel)
        Me.Controls.Add(Me.rightHandlePanel)
        Me.Controls.Add(Me.topHandlePanel)
        Me.Controls.Add(Me.bottomHandlePanel)
        Me.DoubleBuffered = True
        Me.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None
        Me.Name = "MainForm"
        Me.Text = "Tuna"
        CType(Me.WindowsMediaPlayer, System.ComponentModel.ISupportInitialize).EndInit()
        Me.MainDataGridPanel.ResumeLayout(False)
        CType(Me.MainDataGrid, System.ComponentModel.ISupportInitialize).EndInit()
        Me.SelectionsPanel.ResumeLayout(False)
        Me.LeftMenuPanel.ResumeLayout(False)
        Me.btn_Settings.ResumeLayout(False)
        Me.btn_SyncToCloud.ResumeLayout(False)
        Me.btn_ImportFile.ResumeLayout(False)
        Me.btn_ExportSongs.ResumeLayout(False)
        Me.btn_AddToPlaylist.ResumeLayout(False)
        Me.btn_FishSongInfo.ResumeLayout(False)
        Me.TopGradientPanel.ResumeLayout(False)
        Me.TopGradientPanel.PerformLayout()
        Me.BottomControlPanel.ResumeLayout(False)
        Me.BottomControlPanel.PerformLayout()
        CType(Me.Playing_AlbumCover, System.ComponentModel.ISupportInitialize).EndInit()
        CType(Me.PictureBox1, System.ComponentModel.ISupportInitialize).EndInit()
        Me.ResumeLayout(False)

    End Sub

    Friend WithEvents btn_Play As XylosButton
    Friend WithEvents BottomControlPanel As Panel_DoubleBuffered
    Friend WithEvents Playing_AlbumCover As PictureBox
    Friend WithEvents SeekTimeLabel As Label
    Friend WithEvents TimeRemainingLabel As Label
    Friend WithEvents TimeElapsedLabel As Label
    Friend WithEvents volumeSlider As Syncfusion.Windows.Forms.Tools.TrackBarEx
    Friend WithEvents SeekBar As Syncfusion.Windows.Forms.Tools.TrackBarEx
    Friend WithEvents btn_Shuffle As XylosButton
    Friend WithEvents btn_Repeat As XylosButton
    Friend WithEvents btn_Rewind As XylosButton
    Friend WithEvents btn_FastForward As XylosButton
    Friend WithEvents TopGradientPanel As GradientRectangle
    Friend WithEvents LinkSelectionAccent As Panel
    Friend WithEvents Link_Genres As LinkLabel
    Friend WithEvents Link_Albums As LinkLabel
    Friend WithEvents Link_Artists As LinkLabel
    Friend WithEvents Link_Playlists As LinkLabel
    Friend WithEvents Link_Home As LinkLabel
    Friend WithEvents SearchTextBox As MaterialTextBox
    Friend WithEvents Playing_ArtistLabel As Label
    Friend WithEvents Playing_SongLabel As Label
    Friend WithEvents LeftMenuPanel As Panel_DoubleBuffered
    Friend WithEvents btn_SyncToCloud As MaterialPanel
    Friend WithEvents btn_ImportFile As MaterialPanel
    Friend WithEvents btn_ExportSongs As MaterialPanel
    Friend WithEvents btn_AddToPlaylist As MaterialPanel
    Friend WithEvents btn_FishSongInfo As MaterialPanel
    Friend WithEvents SelectionsPanel As Panel_DoubleBuffered
    Friend WithEvents MainDataGridPanel As Panel_DoubleBuffered
    Friend WithEvents LabelClickThrough5 As LabelClickThrough
    Friend WithEvents LabelClickThrough3 As LabelClickThrough
    Friend WithEvents LabelClickThrough4 As LabelClickThrough
    Friend WithEvents LabelClickThrough2 As LabelClickThrough
    Friend WithEvents LabelClickThrough1 As LabelClickThrough
    Friend WithEvents MainDataGrid As DataGridView
    Friend WithEvents BottomBufferPanel As Panel_DoubleBuffered
    Friend WithEvents btn_Settings As MaterialPanel
    Friend WithEvents LabelClickThrough6 As LabelClickThrough
    Friend WithEvents Selections As ListBox
    Friend WithEvents CheckBox As DataGridViewCheckBoxColumn
    Friend WithEvents Index As DataGridViewTextBoxColumn
    Friend WithEvents Song As DataGridViewTextBoxColumn
    Friend WithEvents Artist As DataGridViewTextBoxColumn
    Friend WithEvents Duration As DataGridViewTextBoxColumn
    Friend WithEvents Album As DataGridViewTextBoxColumn
    Friend WithEvents Genre As DataGridViewTextBoxColumn
    Friend WithEvents Play_Count As DataGridViewTextBoxColumn
    Friend WithEvents btn_close As XylosButton
    Friend WithEvents btn_maximize As XylosButton
    Friend WithEvents btn_minimize As XylosButton
    Friend WithEvents leftHandlePanel As Panel_DoubleBuffered
    Friend WithEvents rightHandlePanel As Panel_DoubleBuffered
    Friend WithEvents topHandlePanel As Panel_DoubleBuffered
    Friend WithEvents bottomHandlePanel As Panel_DoubleBuffered
    Friend WithEvents resizeTimer As Timer
    Friend WithEvents WindowsMediaPlayer As AxWMPLib.AxWindowsMediaPlayer
    Friend WithEvents PictureBox1 As PictureBox
End Class
