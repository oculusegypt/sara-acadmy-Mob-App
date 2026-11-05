package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.models.UserRole
import com.example.ui.components.*
import com.example.ui.screens.*
import com.example.ui.screens.student.StudentAdaptiveDashboard
import com.example.ui.screens.parent.ParentPortalScreen
import com.example.ui.screens.instructor.SaraInstructorPortalScreen
import com.example.ui.theme.*
import com.example.ui.viewmodel.CourseSubView
import com.example.ui.viewmodel.OrbitViewModel
import com.example.ui.viewmodel.PortalTab

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                val context = androidx.compose.ui.platform.LocalContext.current
                val viewModel: OrbitViewModel = viewModel()

                LaunchedEffect(Unit) {
                    viewModel.initializeServices(context.applicationContext)
                }

                // Android 13+ (API 33+) POST_NOTIFICATIONS Permission Flow
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                    val permissionLauncher = androidx.activity.compose.rememberLauncherForActivityResult(
                        androidx.activity.result.contract.ActivityResultContracts.RequestPermission()
                    ) { /* permission result handled */ }

                    LaunchedEffect(Unit) {
                        permissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                    }
                }

                OrbitApp(viewModel = viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrbitApp(viewModel: OrbitViewModel) {
    val activePortal by viewModel.activePortal.collectAsState()
    val courseView by viewModel.courseView.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()
    val showAuthDialog by viewModel.showAuthDialog.collectAsState()
    val showBookingDialog by viewModel.showBookingDialog.collectAsState()
    val showCheckoutDialog by viewModel.showCheckoutDialog.collectAsState()
    val showTutorSheet by viewModel.showTutorSheet.collectAsState()
    val selectedCourse by viewModel.selectedCourse.collectAsState()
    val selectedLesson by viewModel.selectedLesson.collectAsState()
    val tutorMessages by viewModel.tutorMessages.collectAsState()
    val tutorInput by viewModel.tutorInput.collectAsState()
    val tutorLoading by viewModel.tutorLoading.collectAsState()
    val activeCall by viewModel.activeCall.collectAsState()
    val allRegisteredUsers by viewModel.allRegisteredUsers.collectAsState()
    val checkoutPricing by viewModel.checkoutPricing.collectAsState()
    val couponFeedback by viewModel.couponFeedback.collectAsState()

    var showMoreSheet by remember { mutableStateOf(false) }

    // BackHandler for smooth nested navigation & in-call handling
    BackHandler(enabled = true) {
        if (showMoreSheet) {
            showMoreSheet = false
        } else if (activeCall != null) {
            viewModel.endCall()
        } else if (activePortal == PortalTab.COURSES && courseView != CourseSubView.CATALOG) {
            when (courseView) {
                CourseSubView.DETAIL -> viewModel.backToCatalog()
                CourseSubView.PLAYER, CourseSubView.QUIZ -> viewModel.backToCourseDetail()
                CourseSubView.CERTIFICATE, CourseSubView.VERIFY -> viewModel.backToCatalog()
                else -> viewModel.backToCatalog()
            }
        } else if (activePortal != PortalTab.HOME) {
            viewModel.setPortal(PortalTab.HOME)
        }
    }

    // If a 1-on-1 private call is active (ringing, connected, or ended), display full-screen call room
    if (activeCall != null) {
        PrivateCallScreen(viewModel = viewModel)
        return
    }

    Scaffold(
        topBar = {
            if (activePortal != PortalTab.CLASSROOM) {
                OrbitTopBar(
                    currentUser = currentUser,
                    onOpenAuth = { viewModel.setShowAuthDialog(true) },
                    onOpenBooking = { viewModel.setShowBookingDialog(true) },
                    onOpenVerifier = { viewModel.openVerifier() },
                    notificationCount = 3
                )
            }
        },
        bottomBar = {
            // Figma Authentic Bottom Navigation Bar
            Surface(
                color = Color.White,
                shadowElevation = 8.dp,
                border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(64.dp)
                        .testTag("main_bottom_nav"),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // 1. الرئيسية (Home)
                    FigmaNavItem(
                        label = "الرئيسية",
                        iconRes = R.drawable.ic_nav_home,
                        isSelected = activePortal == PortalTab.HOME,
                        onClick = { viewModel.setPortal(PortalTab.HOME) },
                        modifier = Modifier.weight(1f)
                    )

                    // 2. أبنائي (My Children / Parent Portal)
                    FigmaNavItem(
                        label = "أبنائي",
                        iconRes = R.drawable.ic_nav_children,
                        isSelected = activePortal == PortalTab.PARENT,
                        onClick = { viewModel.setPortal(PortalTab.PARENT) },
                        modifier = Modifier.weight(1f)
                    )

                    // 3. الجدول / الفصل الحي (Center Prominent Schedule / Class)
                    Box(
                        modifier = Modifier
                            .weight(1.1f)
                            .clickable { viewModel.setPortal(PortalTab.CLASSROOM) },
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (activePortal == PortalTab.CLASSROOM) SaraPurple else SaraLavender),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_nav_schedule),
                                    contentDescription = "الجدول والفصل الحي",
                                    tint = if (activePortal == PortalTab.CLASSROOM) Color.White else SaraPurple,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "الجدول",
                                fontFamily = TajawalFontFamily,
                                fontWeight = if (activePortal == PortalTab.CLASSROOM) FontWeight.Bold else FontWeight.Normal,
                                fontSize = 10.sp,
                                color = if (activePortal == PortalTab.CLASSROOM) SaraPurple else SaraMuted
                            )
                        }
                    }

                    // 4. البرامج التعليمية (Educational Programs / Courses)
                    FigmaNavItem(
                        label = "البرامج",
                        iconRes = R.drawable.ic_srv_programs,
                        isSelected = activePortal == PortalTab.COURSES,
                        onClick = { viewModel.setPortal(PortalTab.COURSES) },
                        modifier = Modifier.weight(1f)
                    )

                    // 5. المزيد (More / Hub)
                    FigmaNavItem(
                        label = "المزيد",
                        iconRes = R.drawable.ic_nav_more,
                        isSelected = showMoreSheet,
                        onClick = { showMoreSheet = true },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        },
        floatingActionButton = {
            // Socratic AI Tutor Quick Floating Button with Sara Theme
            FloatingActionButton(
                onClick = { viewModel.setShowTutorSheet(true) },
                containerColor = SaraGold,
                contentColor = SaraDeepPurple,
                shape = CircleShape,
                modifier = Modifier
                    .padding(bottom = 8.dp)
                    .testTag("fab_socratic_tutor")
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = "المساعد السقراطي لمس سارة",
                    modifier = Modifier.size(24.dp)
                )
            }
        },
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (activePortal) {
                PortalTab.HOME -> HomeScreen(viewModel = viewModel)
                PortalTab.COURSES -> CoursesScreen(viewModel = viewModel)
                PortalTab.LIBRARY -> LibraryScreen(viewModel = viewModel)
                PortalTab.CONNECT -> PrivateConnectScreen(viewModel = viewModel)
                PortalTab.CLASSROOM -> VirtualClassroom(viewModel = viewModel)
                PortalTab.LEARNER -> StudentAdaptiveDashboard(
                    viewModel = viewModel,
                    onNavigateToClassroom = { viewModel.setPortal(PortalTab.CLASSROOM) },
                    onOpenBookPdf = { /* open book */ }
                )
                PortalTab.PARENT -> ParentPortalScreen(viewModel = viewModel)
                PortalTab.INSTRUCTOR -> SaraInstructorPortalScreen(
                    viewModel = viewModel,
                    onLaunchLiveClassroom = { viewModel.setPortal(PortalTab.CLASSROOM) }
                )
                PortalTab.ADMIN -> AdminScreen(viewModel = viewModel)
            }
        }
    }

    // "المزيد" Bottom Sheet Menu for full access to all Sara Al-Araby portals & features
    if (showMoreSheet) {
        ModalBottomSheet(
            onDismissRequest = { showMoreSheet = false },
            containerColor = Color.White,
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
                    .navigationBarsPadding(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "منصة سارة العربي • الخدمات الإضافية",
                    fontFamily = CairoFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = SaraDeepPurple
                )

                HorizontalDivider(color = SaraBorderLight)

                // 1. Instructor Portal
                MoreMenuOption(
                    title = "لوحة المعلمة أ / سارة العربي 💡",
                    subtitle = "إدارة المجموعات، تصحيح الواجبات واعتماد الشهادات",
                    icon = Icons.Default.Psychology,
                    iconColor = SaraGoldDark,
                    onClick = {
                        viewModel.setPortal(PortalTab.INSTRUCTOR)
                        showMoreSheet = false
                    }
                )

                // 2. Student Adaptive Dashboard
                MoreMenuOption(
                    title = "لوحة الطالب المتكيفة 🧒",
                    subtitle = "الروضة، الأبطال الصغار، والعباقرة",
                    icon = Icons.Default.EmojiEvents,
                    iconColor = SaraPurple,
                    onClick = {
                        viewModel.setPortal(PortalTab.LEARNER)
                        showMoreSheet = false
                    }
                )

                // 3. Private 1:1 Call & Screen Sharing
                MoreMenuOption(
                    title = "اتصال خاص ومشاركة شاشة 1:1 📞",
                    subtitle = "شرح فردي ومباشر بالصوت والصورة والشاشة",
                    icon = Icons.Default.PhoneInTalk,
                    iconColor = PastelMintIcon,
                    onClick = {
                        viewModel.setPortal(PortalTab.CONNECT)
                        showMoreSheet = false
                    }
                )

                // 4. Digital Library
                MoreMenuOption(
                    title = "المكتبة الرقمية والملازم المعتمدة 📚",
                    subtitle = "كتب نور البيان وكراسات تمارين السوروبان",
                    icon = Icons.Default.MenuBook,
                    iconColor = PastelBlueIcon,
                    onClick = {
                        viewModel.setPortal(PortalTab.LIBRARY)
                        showMoreSheet = false
                    }
                )

                // 5. Certificate Verifier
                MoreMenuOption(
                    title = "نظام التحقق من الشهادات الرقمية 🎓",
                    subtitle = "فحص الشهادات المعتمدة بالباركود وكود التحقق",
                    icon = Icons.Default.Verified,
                    iconColor = SaraPurple,
                    onClick = {
                        viewModel.openVerifier()
                        showMoreSheet = false
                    }
                )

                // 6. Admin Portal
                MoreMenuOption(
                    title = "لوحة الإدارة والعمليات 🛡️",
                    subtitle = "سجل التدقيق والحركات ومتابعة العمليات",
                    icon = Icons.Default.AdminPanelSettings,
                    iconColor = SaraDeepPurple,
                    onClick = {
                        viewModel.setPortal(PortalTab.ADMIN)
                        showMoreSheet = false
                    }
                )

                // 7. Auth & Account
                MoreMenuOption(
                    title = if (currentUser != null) "الحساب: ${currentUser!!.displayName} 🔐" else "تسجيل الدخول / إنشاء حساب 🔐",
                    subtitle = "إدارة الحسابات المسجلة والتبديل بينها",
                    icon = Icons.Default.AccountCircle,
                    iconColor = SaraPurple,
                    onClick = {
                        viewModel.setShowAuthDialog(true)
                        showMoreSheet = false
                    }
                )

                Spacer(modifier = Modifier.height(10.dp))
            }
        }
    }

    // Modal Dialogs
    if (showAuthDialog) {
        AuthDialog(
            currentUser = currentUser,
            allRegisteredUsers = allRegisteredUsers,
            onSelectUser = { viewModel.switchUser(it) },
            onLogin = { email, pass, cb -> viewModel.loginUser(email, pass, cb) },
            onRegister = { name, email, pass, role, phone, bio, cb ->
                viewModel.registerUser(name, email, pass, role, phone, bio, cb)
            },
            onDismiss = { viewModel.setShowAuthDialog(false) }
        )
    }

    if (showBookingDialog) {
        BookingConsultationDialog(
            currentUserId = currentUser?.id ?: "guest",
            currentUserName = currentUser?.displayName ?: "زائر",
            onSubmit = { parent, child, age, tel, service, cb ->
                viewModel.bookConsultation(parent, child, age, tel, service, cb)
            },
            onBookingSaved = { /* booking persisted */ },
            onDismiss = { viewModel.setShowBookingDialog(false) }
        )
    }

    if (showCheckoutDialog && selectedCourse != null) {
        CheckoutDialog(
            course = selectedCourse!!,
            pricing = checkoutPricing,
            couponFeedback = couponFeedback,
            onApplyCoupon = { viewModel.applyCouponCode(it) },
            onConfirm = { course, method -> viewModel.completeCheckout(course, method) },
            onDismiss = { viewModel.setShowCheckoutDialog(false) }
        )
    }

    if (showTutorSheet) {
        SocraticTutorSheet(
            lessonTitle = selectedLesson?.title ?: selectedCourse?.title ?: "الحساب الذهني وتنمية الذكاء",
            messages = tutorMessages,
            inputText = tutorInput,
            isLoading = tutorLoading,
            isAiEngineLive = viewModel.isAiTutorLive,
            onInputChanged = { viewModel.setTutorInput(it) },
            onSendMessage = { viewModel.sendTutorQuery(it) },
            onDismiss = { viewModel.setShowTutorSheet(false) }
        )
    }
}

@Composable
fun FigmaNavItem(
    label: String,
    iconRes: Int,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxHeight()
            .clickable { onClick() },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            painter = painterResource(id = iconRes),
            contentDescription = label,
            tint = if (isSelected) SaraPurple else SaraMuted,
            modifier = Modifier.size(22.dp)
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = label,
            fontFamily = TajawalFontFamily,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            fontSize = 10.sp,
            color = if (isSelected) SaraPurple else SaraMuted
        )
    }
}

@Composable
fun MoreMenuOption(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconColor: Color,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = SaraPageBg,
        border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(iconColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(22.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontFamily = TajawalFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = SaraInk
                )
                Text(
                    text = subtitle,
                    fontFamily = TajawalFontFamily,
                    fontSize = 10.sp,
                    color = SaraMuted
                )
            }

            Text(
                text = "‹",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = SaraPurple
            )
        }
    }
}
