package com.example.ui.screens.student

import androidx.compose.animation.*
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.data.models.*
import com.example.ui.screens.FigmaSectionHeader
import com.example.ui.screens.FigmaServiceCard
import com.example.ui.screens.FigmaStatItem
import com.example.ui.theme.*
import com.example.ui.viewmodel.OrbitViewModel

/**
 * Figma-Authentic Age-Adaptive Student Dashboard for Sara Al-Araby Platform.
 * Matches Screenshot 2 and Figma design tokens:
 * - Kindergarten / Junior hero banner with crayons image and level badge
 * - 4-item stats strip
 * - 6 level subjects in pastel colored cards with official Figma icons
 * - Progress card with 3D trophy & 75% bar
 * - Upcoming class card with date, time, and join button
 * - Motivational rewards purple banner with gift box
 * - Interactive activities ("وصّل الصورة", "تتبّع الحرف أ", "العداد الصيني")
 */
@Composable
fun StudentAdaptiveDashboard(
    viewModel: OrbitViewModel,
    onNavigateToClassroom: () -> Unit,
    onOpenBookPdf: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var selectedTier by remember { mutableStateOf(AgeTier.EARLY_CHILDHOOD) }
    var selectedActivityModal by remember { mutableStateOf<String?>(null) }
    var selectedSubjectDetail by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(SaraPageBg)
            .padding(horizontal = 14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // 1. Student Age-Tier Selector Pills
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    AgeTier.EARLY_CHILDHOOD to "حتى 6 سنوات (الروضة)",
                    AgeTier.JUNIOR_CHAMPIONS to "7 إلى 8 سنوات",
                    AgeTier.YOUNG_GENIUSES to "9 إلى 14 سنة"
                ).forEach { (tier, label) ->
                    val isSelected = selectedTier == tier
                    Button(
                        onClick = { selectedTier = tier },
                        shape = RoundedCornerShape(999.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSelected) SaraPurple else SaraLavender,
                            contentColor = if (isSelected) Color.White else SaraDeepPurple
                        ),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(34.dp)
                    ) {
                        Text(
                            text = label,
                            fontFamily = TajawalFontFamily,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            fontSize = 9.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }

        // 2. Hero Banner (Figma exact Screenshot 2: Girl with crayons, level badge, gold button)
        item {
            Card(
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("student_hero_card")
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
                        // Text Column
                        Column(
                            modifier = Modifier
                                .weight(1.1f)
                                .padding(vertical = 4.dp)
                        ) {
                            // Gold Level Badge
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(999.dp))
                                    .background(SaraGold)
                                    .padding(horizontal = 10.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = when (selectedTier) {
                                        AgeTier.EARLY_CHILDHOOD -> "مستوى الروضة"
                                        AgeTier.JUNIOR_CHAMPIONS -> "مستوى الأبطال الصغار"
                                        AgeTier.YOUNG_GENIUSES -> "مستوى العباقرة"
                                    },
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.sp,
                                    color = SaraDeepPurple
                                )
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            Text(
                                text = "تعلم .. العب .. اكتشف",
                                fontFamily = CairoFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = Color.White,
                                lineHeight = 24.sp
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = "رحلة تعليمية ممتعة لطفلك في عالم مليء بالمعرفة",
                                fontFamily = TajawalFontFamily,
                                fontSize = 10.sp,
                                color = Color.White.copy(alpha = 0.88f),
                                lineHeight = 14.sp
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            Button(
                                onClick = onNavigateToClassroom,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = SaraGold,
                                    contentColor = SaraDeepPurple
                                ),
                                shape = RoundedCornerShape(999.dp),
                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Text(
                                    text = "استكشف الآن ←",
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        // Hero Banner Image (Girl with crayons)
                        Image(
                            painter = painterResource(id = R.drawable.img_hero_student),
                            contentDescription = "طالبة الروضة والألوان",
                            modifier = Modifier
                                .weight(0.9f)
                                .height(130.dp),
                            contentScale = ContentScale.Fit
                        )
                    }
                }
            }
        }

        // 3. Stats Section (Figma: 4 items grid with vertical dividers)
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("student_stats_strip")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    FigmaStatItem(
                        iconRes = R.drawable.ic_stat_children,
                        value = "5",
                        label = "أطفال مسجلين",
                        modifier = Modifier.weight(1f)
                    )

                    VerticalDivider(modifier = Modifier.height(38.dp), color = SaraBorderLight)

                    FigmaStatItem(
                        iconRes = R.drawable.ic_srv_booking,
                        value = "12",
                        label = "حصة هذا الشهر",
                        modifier = Modifier.weight(1f)
                    )

                    VerticalDivider(modifier = Modifier.height(38.dp), color = SaraBorderLight)

                    FigmaStatItem(
                        iconRes = R.drawable.ic_stat_trophy,
                        value = "95%",
                        label = "معدل الإنجاز",
                        modifier = Modifier.weight(1f)
                    )

                    VerticalDivider(modifier = Modifier.height(38.dp), color = SaraBorderLight)

                    FigmaStatItem(
                        iconRes = R.drawable.ic_stat_star,
                        value = "18",
                        label = "نقطة التميز",
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // 4. Section: مميزات المستوى (Level Subjects - 6 Pastel Cards)
        item {
            FigmaSectionHeader(title = "مميزات المستوى")
        }

        item {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Row 1: العلوم | الرياضيات | اللغة العربية
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FigmaServiceCard(
                        title = "العلوم",
                        subtitle = "اكتشف عالمك من حولك",
                        iconRes = R.drawable.ic_subj_science,
                        bgColor = PastelLavenderBg,
                        iconTint = PastelLavenderIcon,
                        onClick = { selectedSubjectDetail = "العلوم: استكشاف الطبيعة والكون" },
                        modifier = Modifier.weight(1f)
                    )

                    FigmaServiceCard(
                        title = "الرياضيات",
                        subtitle = "أرقام وعمليات بسيطة",
                        iconRes = R.drawable.ic_subj_math,
                        bgColor = PastelLavenderBg,
                        iconTint = PastelLavenderIcon,
                        onClick = { selectedSubjectDetail = "الرياضيات: الأرقام والحساب الذهني والسوروبان" },
                        modifier = Modifier.weight(1f)
                    )

                    FigmaServiceCard(
                        title = "اللغة العربية",
                        subtitle = "تعلم الحروف والكلمات",
                        iconRes = R.drawable.ic_subj_arabic,
                        bgColor = PastelPeachBg,
                        iconTint = PastelPeachIcon,
                        onClick = { selectedSubjectDetail = "اللغة العربية: تأسيس نور البيان والقرائية" },
                        modifier = Modifier.weight(1f)
                    )
                }

                // Row 2: الأنشطة الاجتماعية | الأنشطة الرياضية | الفنون
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FigmaServiceCard(
                        title = "الأنشطة الاجتماعية",
                        subtitle = "تعلم مع أصدقائك",
                        iconRes = R.drawable.ic_subj_social,
                        bgColor = PastelMintBg,
                        iconTint = PastelMintIcon,
                        onClick = { selectedSubjectDetail = "الأنشطة الاجتماعية: العمل الجماعي والذكاء الوجداني" },
                        modifier = Modifier.weight(1f)
                    )

                    FigmaServiceCard(
                        title = "الأنشطة الرياضية",
                        subtitle = "لعب ونشاط وصحة",
                        iconRes = R.drawable.ic_subj_sports,
                        bgColor = PastelBlueBg,
                        iconTint = PastelBlueIcon,
                        onClick = { selectedSubjectDetail = "الأنشطة الرياضية: الحركة والنشاط البدني الذكي" },
                        modifier = Modifier.weight(1f)
                    )

                    FigmaServiceCard(
                        title = "الفنون",
                        subtitle = "أبدع وطور مهاراتك",
                        iconRes = R.drawable.ic_subj_arts,
                        bgColor = PastelPeachBg,
                        iconTint = PastelPeachIcon,
                        onClick = { selectedSubjectDetail = "الفنون: الرسم والتلوين والابتكار" },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // 5. Section: تقدم طفلك (Child's Progress Card)
        item {
            FigmaSectionHeader(title = "تقدم طفلك")
        }

        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_banner_trophy),
                        contentDescription = null,
                        tint = SaraGold,
                        modifier = Modifier.size(46.dp)
                    )

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = when (selectedTier) {
                                AgeTier.EARLY_CHILDHOOD -> "مستوى الروضة - الفصل الأول"
                                AgeTier.JUNIOR_CHAMPIONS -> "مستوى الأبطال الصغار - الفصل الأول"
                                AgeTier.YOUNG_GENIUSES -> "مستوى العباقرة - الفصل الأول"
                            },
                            fontFamily = TajawalFontFamily,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = SaraDeepPurple
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        // Custom Progress Bar
                        LinearProgressIndicator(
                            progress = { 0.75f },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(99.dp)),
                            color = SaraPurple,
                            trackColor = SaraLavender
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "75% من الدروس مكتملة",
                            fontFamily = TajawalFontFamily,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = SaraPurple
                        )
                    }

                    Button(
                        onClick = { onOpenBookPdf("خطة تقدم الطالب") },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = SaraPurple,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(999.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Text(
                            text = "عرض التفاصيل ←",
                            fontFamily = TajawalFontFamily,
                            fontWeight = FontWeight.Bold,
                            fontSize = 9.sp
                        )
                    }
                }
            }
        }

        // 6. Section: الحصص القادمة (Upcoming Class Card)
        item {
            FigmaSectionHeader(title = "الحصص القادمة")
        }

        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Date Column
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(end = 8.dp)
                    ) {
                        Text(
                            text = "السبت",
                            fontFamily = TajawalFontFamily,
                            fontSize = 10.sp,
                            color = SaraMuted
                        )
                        Text(
                            text = "27",
                            fontFamily = TajawalFontFamily,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 20.sp,
                            color = SaraDeepPurple
                        )
                        Text(
                            text = "سبتمبر",
                            fontFamily = TajawalFontFamily,
                            fontSize = 9.sp,
                            color = SaraMuted
                        )
                    }

                    VerticalDivider(modifier = Modifier.height(44.dp), color = SaraBorderLight)

                    // Subject & Time
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 12.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "لغة عربية",
                                fontFamily = TajawalFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = SaraInk
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(SaraLavender),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_srv_live_class),
                                    contentDescription = null,
                                    tint = SaraPurple,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                        Text(
                            text = "10:00 ص - 10:45 ص",
                            fontFamily = TajawalFontFamily,
                            fontSize = 11.sp,
                            color = SaraMuted
                        )
                    }

                    // Join Button
                    Button(
                        onClick = onNavigateToClassroom,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = SaraPurple,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(999.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        modifier = Modifier.height(34.dp)
                    ) {
                        Text(
                            text = "الانضمام للحصة ▶",
                            fontFamily = TajawalFontFamily,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }

        // 7. Motivational Bottom Banner (مكافآت وإنجازات)
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                modifier = Modifier.fillMaxWidth()
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
                                painter = painterResource(id = R.drawable.ic_banner_gift),
                                contentDescription = null,
                                tint = SaraGold,
                                modifier = Modifier.size(36.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "مكافآت وإنجازات",
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = Color.White
                                )
                                Text(
                                    text = "كل إنجاز .. يقربك من النجاح",
                                    fontFamily = TajawalFontFamily,
                                    fontSize = 10.sp,
                                    color = Color.White.copy(alpha = 0.85f)
                                )
                            }
                        }

                        Button(
                            onClick = { selectedActivityModal = "أوسمة ونقاط التميز: لديك 18 نقطة و 4 أوسمة ذهبية معتمدة!" },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = SaraGold,
                                contentColor = SaraDeepPurple
                            ),
                            shape = RoundedCornerShape(999.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                            modifier = Modifier.height(30.dp)
                        ) {
                            Text(
                                text = "عرض المكافآت ←",
                                fontFamily = TajawalFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp
                            )
                        }
                    }
                }
            }
        }

        // 8. Section: أنشطتي التفاعلية (Match & Letter Tracing from Figma)
        item {
            FigmaSectionHeader(title = "أنشطتي التفاعلية")
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Activity 1: وصّل الصورة
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PastelLavenderBg),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                    modifier = Modifier
                        .weight(1f)
                        .height(118.dp)
                        .clickable { selectedActivityModal = "لعبة وصّل الصورة: اختر الصورة المطابقة للكلمة" }
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(10.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "وصّل الصورة",
                                fontFamily = TajawalFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = SaraDeepPurple
                            )
                            Text(text = "‹", color = SaraPurple, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }

                        Image(
                            painter = painterResource(id = R.drawable.img_activity_match),
                            contentDescription = "وصّل الصورة",
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(46.dp),
                            contentScale = ContentScale.Fit
                        )
                    }
                }

                // Activity 2: تتبّع الحرف (أ)
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PastelPeachBg),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                    modifier = Modifier
                        .weight(1f)
                        .height(118.dp)
                        .clickable { selectedActivityModal = "تتبّع الحرف: ارسم بيدك حرف (أ) و (ب) مع نطق مس سارة العربي" }
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(10.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "تتبّع الحرف",
                                fontFamily = TajawalFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = Color(0xFF9A3412)
                            )
                            Text(text = "‹", color = SaraPurple, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }

                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "أ",
                                fontFamily = CairoFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 42.sp,
                                color = SaraPurple
                            )
                        }
                    }
                }
            }
        }

        // 9. Big Subjects Buttons: اللغة العربية & الرياضيات
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PastelPeachBg),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                    modifier = Modifier
                        .weight(1f)
                        .height(100.dp)
                        .clickable { selectedSubjectDetail = "اللغة العربية: الحروف والكلمات وأصوات نور البيان" }
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_big_arabic),
                            contentDescription = null,
                            tint = Color.Unspecified,
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "اللغة العربية",
                            fontFamily = TajawalFontFamily,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = SaraInk
                        )
                    }
                }

                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PastelBlueBg),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
                    modifier = Modifier
                        .weight(1f)
                        .height(100.dp)
                        .clickable { selectedSubjectDetail = "الرياضيات: العداد الصيني والعمليات الذهنية السريعة" }
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_big_math),
                            contentDescription = null,
                            tint = Color.Unspecified,
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "الرياضيات",
                            fontFamily = TajawalFontFamily,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = SaraInk
                        )
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(18.dp))
        }
    }

    // Interactive Modals
    if (selectedActivityModal != null) {
        AlertDialog(
            onDismissRequest = { selectedActivityModal = null },
            title = {
                Text(
                    text = "🌟 نشاط تفاعلي ممتع",
                    fontFamily = CairoFontFamily,
                    fontWeight = FontWeight.Bold,
                    color = SaraDeepPurple
                )
            },
            text = {
                Text(
                    text = selectedActivityModal!!,
                    fontFamily = TajawalFontFamily,
                    fontSize = 14.sp,
                    color = SaraInk
                )
            },
            confirmButton = {
                Button(
                    onClick = { selectedActivityModal = null },
                    colors = ButtonDefaults.buttonColors(containerColor = SaraPurple)
                ) {
                    Text("تم", fontFamily = TajawalFontFamily, fontWeight = FontWeight.Bold)
                }
            }
        )
    }

    if (selectedSubjectDetail != null) {
        AlertDialog(
            onDismissRequest = { selectedSubjectDetail = null },
            title = {
                Text(
                    text = "📚 تفاصيل المادة التعليمية",
                    fontFamily = CairoFontFamily,
                    fontWeight = FontWeight.Bold,
                    color = SaraDeepPurple
                )
            },
            text = {
                Text(
                    text = selectedSubjectDetail!!,
                    fontFamily = TajawalFontFamily,
                    fontSize = 14.sp,
                    color = SaraInk
                )
            },
            confirmButton = {
                Button(
                    onClick = { selectedSubjectDetail = null },
                    colors = ButtonDefaults.buttonColors(containerColor = SaraPurple)
                ) {
                    Text("إغلاق", fontFamily = TajawalFontFamily, fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}
