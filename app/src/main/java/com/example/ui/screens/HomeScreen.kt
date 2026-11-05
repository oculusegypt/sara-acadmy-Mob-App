package com.example.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.components.MentalMathGame
import com.example.ui.theme.*
import com.example.ui.viewmodel.OrbitViewModel
import com.example.ui.viewmodel.PortalTab

@Composable
fun HomeScreen(
    viewModel: OrbitViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val courses by viewModel.courses.collectAsState()
    val mentalMathDifficulty by viewModel.mentalMathDifficulty.collectAsState()
    val mentalMathGameState by viewModel.mentalMathGameState.collectAsState()
    val mentalMathCurrentNumber by viewModel.mentalMathCurrentNumber.collectAsState()
    val mentalMathSequence by viewModel.mentalMathSequence.collectAsState()
    val mentalMathUserAnswer by viewModel.mentalMathUserAnswer.collectAsState()
    val mentalMathIsCorrect by viewModel.mentalMathIsCorrect.collectAsState()
    val mentalMathStreak by viewModel.mentalMathStreak.collectAsState()
    val mentalMathXp by viewModel.mentalMathXp.collectAsState()

    var showChildDetailDialog by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(SaraPageBg)
            .padding(horizontal = 14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // 1. Hero Banner (Figma exact: with student girl, headphones, purple gradient wave)
        item {
            Card(
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("home_hero_card")
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                listOf(SaraPurple, SaraDeepPurple)
                            )
                        )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(start = 14.dp, top = 10.dp, bottom = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Text & Call to Action
                        Column(
                            modifier = Modifier
                                .weight(1.1f)
                                .padding(vertical = 4.dp)
                        ) {
                            Text(
                                text = "معًا .. نحو مستقبل\nتعليمي أفضل",
                                fontFamily = CairoFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = Color.White,
                                lineHeight = 24.sp
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = "تعليم تفاعلي .. متابعة مستمرة .. نجاح مضمون",
                                fontFamily = TajawalFontFamily,
                                fontSize = 10.sp,
                                color = Color.White.copy(alpha = 0.88f),
                                lineHeight = 14.sp
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            // Gold Action Button
                            Button(
                                onClick = { viewModel.setPortal(PortalTab.LEARNER) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = SaraGold,
                                    contentColor = SaraDeepPurple
                                ),
                                shape = RoundedCornerShape(999.dp),
                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                                modifier = Modifier
                                    .height(34.dp)
                                    .testTag("hero_start_learning_btn")
                            ) {
                                Text(
                                    text = "ابدأ التعلم الآن ←",
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        // Hero Banner Image (Girl with headphones)
                        Image(
                            painter = painterResource(id = R.drawable.img_hero_parent),
                            contentDescription = "طالبة متفوقة",
                            modifier = Modifier
                                .weight(0.9f)
                                .height(130.dp),
                            contentScale = ContentScale.Fit
                        )
                    }
                }
            }
        }

        // 2. Stats Section (Figma: 4 items grid with vertical dividers)
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("stats_card_strip")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Stat 1: أبناؤك (5)
                    FigmaStatItem(
                        iconRes = R.drawable.ic_stat_children,
                        value = "5",
                        label = "أبناؤك",
                        modifier = Modifier.weight(1f)
                    )

                    VerticalDivider(modifier = Modifier.height(38.dp), color = SaraBorderLight)

                    // Stat 2: حصة هذا الشهر (12)
                    FigmaStatItem(
                        iconRes = R.drawable.ic_srv_booking,
                        value = "12",
                        label = "حصة هذا الشهر",
                        modifier = Modifier.weight(1f)
                    )

                    VerticalDivider(modifier = Modifier.height(38.dp), color = SaraBorderLight)

                    // Stat 3: معدل الإنجاز (95%)
                    FigmaStatItem(
                        iconRes = R.drawable.ic_stat_trophy,
                        value = "95%",
                        label = "معدل الإنجاز",
                        modifier = Modifier.weight(1f)
                    )

                    VerticalDivider(modifier = Modifier.height(38.dp), color = SaraBorderLight)

                    // Stat 4: نقاط التميز (18)
                    FigmaStatItem(
                        iconRes = R.drawable.ic_stat_star,
                        value = "18",
                        label = "نقاط التميز",
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // 3. Section: خدماتنا الرئيسية (Our Main Services - 6 Pastel Cards)
        item {
            FigmaSectionHeader(title = "خدماتنا الرئيسية")
        }

        item {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Row 1: البرامج التعليمية | حجز الحصص | الفصل المباشر
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FigmaServiceCard(
                        title = "البرامج التعليمية",
                        subtitle = "اكتشف برامجنا المميزة",
                        iconRes = R.drawable.ic_srv_programs,
                        bgColor = PastelLavenderBg,
                        iconTint = PastelLavenderIcon,
                        onClick = { viewModel.setPortal(PortalTab.COURSES) },
                        modifier = Modifier.weight(1f)
                    )

                    FigmaServiceCard(
                        title = "حجز الحصص",
                        subtitle = "اختر موعدك بسهولة",
                        iconRes = R.drawable.ic_srv_booking,
                        bgColor = PastelBlueBg,
                        iconTint = PastelBlueIcon,
                        onClick = { viewModel.setShowBookingDialog(true) },
                        modifier = Modifier.weight(1f)
                    )

                    FigmaServiceCard(
                        title = "الفصل المباشر",
                        subtitle = "انضم لفصلك الآن",
                        iconRes = R.drawable.ic_srv_live_class,
                        bgColor = PastelMintBg,
                        iconTint = PastelMintIcon,
                        onClick = { viewModel.setPortal(PortalTab.CLASSROOM) },
                        modifier = Modifier.weight(1f)
                    )
                }

                // Row 2: الاشتراكات والفواتير | التقارير والمتابعة | الدعم والمساعدة
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FigmaServiceCard(
                        title = "الاشتراكات والفواتير",
                        subtitle = "إدارة اشتراكاتك",
                        iconRes = R.drawable.ic_srv_billing,
                        bgColor = PastelPeachBg,
                        iconTint = PastelPeachIcon,
                        onClick = { viewModel.setPortal(PortalTab.PARENT) },
                        modifier = Modifier.weight(1f)
                    )

                    FigmaServiceCard(
                        title = "التقارير والمتابعة",
                        subtitle = "تابع تقدم أبنائك",
                        iconRes = R.drawable.ic_srv_reports,
                        bgColor = PastelAquaBg,
                        iconTint = PastelAquaIcon,
                        onClick = { viewModel.setPortal(PortalTab.PARENT) },
                        modifier = Modifier.weight(1f)
                    )

                    FigmaServiceCard(
                        title = "الدعم والمساعدة",
                        subtitle = "نحن معك دائماً",
                        iconRes = R.drawable.ic_srv_support,
                        bgColor = PastelPinkBg,
                        iconTint = PastelPinkIcon,
                        onClick = {
                            val url = "https://wa.me/201028340042?text=" + Uri.encode("مرحباً أ/ سارة العربي، أود الاستفسار عن خدمات المنصة")
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                            context.startActivity(intent)
                        },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // 4. Section: أحدث الإعلانات (Latest Announcements)
        item {
            FigmaSectionHeader(title = "أحدث الإعلانات")
        }

        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.setPortal(PortalTab.COURSES) }
                    .testTag("home_announcement_card")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "بداية الفصل الدراسي الجديد",
                            fontFamily = TajawalFontFamily,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = SaraDeepPurple
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "نتمنى لجميع طلابنا عاماً دراسياً موفقاً ومليئاً بالنجاح",
                            fontFamily = TajawalFontFamily,
                            fontSize = 10.sp,
                            color = SaraMuted
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "📅 2025/09/01",
                            fontFamily = TajawalFontFamily,
                            fontSize = 9.sp,
                            color = SaraPurple,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Button(
                        onClick = { viewModel.setPortal(PortalTab.COURSES) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = SaraPurple,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(999.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Text(
                            text = "عرض الكل ←",
                            fontFamily = TajawalFontFamily,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }

        // 5. Section: أبنائي الأعزاء (My Dear Children - Strip)
        item {
            FigmaSectionHeader(title = "أبنائي الأعزاء")
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                // Card 1: Add New Child (+)
                Card(
                    shape = RoundedCornerShape(13.dp),
                    colors = CardDefaults.cardColors(containerColor = PastelLavenderBg),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                    modifier = Modifier
                        .weight(1f)
                        .height(115.dp)
                        .clickable { viewModel.setShowBookingDialog(true) }
                        .testTag("add_child_button")
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "+",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Light,
                            color = SaraPurple
                        )
                        Text(
                            text = "إضافة ابن جديد",
                            fontFamily = TajawalFontFamily,
                            fontWeight = FontWeight.Bold,
                            fontSize = 9.sp,
                            textAlign = TextAlign.Center,
                            color = SaraPurple
                        )
                    }
                }

                // Child 1: علي أحمد
                FigmaChildCard(
                    name = "علي أحمد",
                    level = "المستوى الثالث",
                    imageRes = R.drawable.img_avatar_boy,
                    onViewDetails = {
                        viewModel.setPortal(PortalTab.PARENT)
                    },
                    modifier = Modifier.weight(1f)
                )

                // Child 2: فاطمة أحمد
                FigmaChildCard(
                    name = "فاطمة أحمد",
                    level = "المستوى الأول",
                    imageRes = R.drawable.img_avatar_fatima,
                    onViewDetails = {
                        viewModel.setPortal(PortalTab.LEARNER)
                    },
                    modifier = Modifier.weight(1f)
                )

                // Child 3: محمد أحمد
                FigmaChildCard(
                    name = "محمد أحمد",
                    level = "المستوى الثاني",
                    imageRes = R.drawable.img_avatar_boy,
                    onViewDetails = {
                        viewModel.setPortal(PortalTab.PARENT)
                    },
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // 6. Purple Motivational Banner (Figma: مع سارة العربي .. كل خطوة نحو التميز)
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("purple_motivational_banner")
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                listOf(SaraPurple, SaraDeepPurple)
                            )
                        )
                        .padding(horizontal = 14.dp, vertical = 12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_banner_trophy),
                                contentDescription = null,
                                tint = SaraGold,
                                modifier = Modifier.size(36.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "مع سارة العربي ..",
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = Color.White
                                )
                                Text(
                                    text = "كل خطوة نحو التميز",
                                    fontFamily = TajawalFontFamily,
                                    fontSize = 11.sp,
                                    color = Color.White.copy(alpha = 0.85f)
                                )
                            }
                        }

                        Button(
                            onClick = { viewModel.setPortal(PortalTab.COURSES) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = SaraGold,
                                contentColor = SaraDeepPurple
                            ),
                            shape = RoundedCornerShape(999.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                            modifier = Modifier.height(30.dp)
                        ) {
                            Text(
                                text = "اكتشف المزيد ←",
                                fontFamily = TajawalFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp
                            )
                        }
                    }
                }
            }
        }

        // 7. Interactive Mental Math & Skill Practice (Preserving rich learning mechanics)
        item {
            MentalMathGame(
                difficulty = mentalMathDifficulty,
                gameState = mentalMathGameState,
                currentNumber = mentalMathCurrentNumber,
                sequence = mentalMathSequence,
                userAnswer = mentalMathUserAnswer,
                isCorrect = mentalMathIsCorrect,
                streak = mentalMathStreak,
                xpScore = mentalMathXp,
                onSelectDifficulty = { viewModel.setMentalMathDifficulty(it) },
                onStartGame = { viewModel.startMentalMathChallenge() },
                onSubmitAnswer = { viewModel.submitMentalMathAnswer(it) }
            )
        }

        item {
            Spacer(modifier = Modifier.height(18.dp))
        }
    }
}

// Reusable Components matching Figma design tokens & widgets
@Composable
fun FigmaSectionHeader(title: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.padding(top = 6.dp, bottom = 2.dp)
    ) {
        Text(
            text = title,
            fontFamily = TajawalFontFamily,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp,
            color = SaraInk
        )
        Box(
            modifier = Modifier
                .width(22.dp)
                .height(2.dp)
                .background(SaraPurple, RoundedCornerShape(2.dp))
        )
    }
}

@Composable
fun FigmaStatItem(
    iconRes: Int,
    value: String,
    label: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.padding(vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            painter = painterResource(id = iconRes),
            contentDescription = label,
            tint = Color.Unspecified,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            fontFamily = TajawalFontFamily,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp,
            color = SaraInk
        )
        Text(
            text = label,
            fontFamily = TajawalFontFamily,
            fontSize = 9.sp,
            color = SaraMuted
        )
    }
}

@Composable
fun FigmaServiceCard(
    title: String,
    subtitle: String,
    iconRes: Int,
    bgColor: Color,
    iconTint: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(15.dp),
        colors = CardDefaults.cardColors(containerColor = bgColor),
        border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier
            .height(84.dp)
            .clickable { onClick() }
            .testTag("service_card_${title}")
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 4.dp, vertical = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                painter = painterResource(id = iconRes),
                contentDescription = title,
                tint = Color.Unspecified,
                modifier = Modifier.size(24.dp)
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = title,
                fontFamily = TajawalFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = SaraInk,
                maxLines = 1,
                textAlign = TextAlign.Center
            )

            Text(
                text = "$subtitle ‹",
                fontFamily = TajawalFontFamily,
                fontSize = 8.sp,
                color = iconTint,
                maxLines = 1,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun FigmaChildCard(
    name: String,
    level: String,
    imageRes: Int,
    onViewDetails: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(13.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier
            .height(115.dp)
            .clickable { onViewDetails() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(4.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
            ) {
                Image(
                    painter = painterResource(id = imageRes),
                    contentDescription = name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            Spacer(modifier = Modifier.height(3.dp))

            Text(
                text = name,
                fontFamily = TajawalFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                color = SaraInk,
                maxLines = 1
            )

            Text(
                text = level,
                fontFamily = TajawalFontFamily,
                fontSize = 8.sp,
                color = SaraMuted,
                maxLines = 1
            )

            Spacer(modifier = Modifier.height(4.dp))

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(SaraPurple)
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "عرض التفاصيل",
                    fontFamily = TajawalFontFamily,
                    fontSize = 7.sp,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
