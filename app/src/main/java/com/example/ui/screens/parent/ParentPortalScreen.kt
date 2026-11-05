package com.example.ui.screens.parent

import androidx.compose.animation.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.data.models.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.OrbitViewModel
import com.example.ui.viewmodel.PortalTab

/**
 * Authentic Figma-styled "أبنائي الأعزاء" (Children / Parent Portal)
 * Matches Figma App.tsx `Children`, `Profile`, and `AddChild` screens.
 */
@Composable
fun ParentPortalScreen(
    viewModel: OrbitViewModel,
    modifier: Modifier = Modifier
) {
    var activeSubScreen by remember { mutableStateOf("list") } // "list", "profile", "add"
    var selectedChildName by remember { mutableStateOf("فاطمة أحمد") }
    var selectedChildAge by remember { mutableStateOf("حتى 6 سنوات") }
    var selectedChildImage by remember { mutableStateOf(R.drawable.img_avatar_fatima) }

    var newChildName by remember { mutableStateOf("") }
    var newChildAge by remember { mutableStateOf("حتى 6 سنوات") }
    var newChildCountry by remember { mutableStateOf("مصر") }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(SaraPageBg)
    ) {
        when (activeSubScreen) {
            "add" -> {
                // Add Child Form Screen (Figma App.tsx `AddChild`)
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    item {
                        Text(
                            text = "إضافة طفل",
                            fontFamily = CairoFontFamily,
                            fontWeight = FontWeight.Bold,
                            fontSize = 22.sp,
                            color = SaraDeepPurple
                        )
                        Text(
                            text = "البيانات الأساسية فقط، لتحديد تجربة التعلم المناسبة.",
                            fontFamily = TajawalFontFamily,
                            fontSize = 12.sp,
                            color = SaraMuted
                        )
                    }

                    // Field: Child Name
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "اسم الطفل",
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = SaraInk
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                OutlinedTextField(
                                    value = newChildName,
                                    onValueChange = { newChildName = it },
                                    placeholder = { Text("مثال: يوسف أحمد", fontFamily = TajawalFontFamily, fontSize = 13.sp) },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp)
                                )
                            }
                        }
                    }

                    // Field: Age Category (Pills)
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "الفئة العمرية",
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = SaraInk
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    listOf("حتى 6 سنوات", "7 إلى 8 سنوات", "9 إلى 14 سنة").forEach { ageOption ->
                                        val isSel = newChildAge == ageOption
                                        Button(
                                            onClick = { newChildAge = ageOption },
                                            shape = RoundedCornerShape(12.dp),
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = if (isSel) SaraPurple else SaraLavender,
                                                contentColor = if (isSel) Color.White else SaraDeepPurple
                                            ),
                                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 8.dp),
                                            modifier = Modifier
                                                .weight(1f)
                                                .height(56.dp)
                                        ) {
                                            Text(
                                                text = ageOption,
                                                fontFamily = TajawalFontFamily,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 11.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Field: Country
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "الدولة",
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = SaraInk
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    listOf("مصر 🇪🇬", "السعودية 🇸🇦", "الإمارات 🇦🇪").forEach { c ->
                                        val isSel = newChildCountry.startsWith(c.take(3))
                                        OutlinedButton(
                                            onClick = { newChildCountry = c },
                                            colors = ButtonDefaults.outlinedButtonColors(
                                                containerColor = if (isSel) SaraLavender else Color.Transparent
                                            ),
                                            shape = RoundedCornerShape(10.dp),
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Text(text = c, fontFamily = TajawalFontFamily, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    item {
                        Text(
                            text = "لا نطلب بيانات مالية أو معلومات إضافية عن الطفل هنا.",
                            fontFamily = TajawalFontFamily,
                            fontSize = 11.sp,
                            color = SaraMuted
                        )
                    }

                    // Submit & Back Buttons
                    item {
                        Button(
                            onClick = {
                                selectedChildName = if (newChildName.isNotBlank()) newChildName else "اسم الطالب"
                                selectedChildAge = newChildAge
                                selectedChildImage = if (newChildAge == "حتى 6 سنوات") R.drawable.img_avatar_fatima else R.drawable.img_avatar_boy
                                activeSubScreen = "profile"
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = SaraPurple),
                            shape = RoundedCornerShape(999.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(46.dp)
                        ) {
                            Text(
                                text = "معاينة ملف الطفل ←",
                                fontFamily = TajawalFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Button(
                            onClick = { activeSubScreen = "list" },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = SaraLavender,
                                contentColor = SaraDeepPurple
                            ),
                            shape = RoundedCornerShape(999.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(44.dp)
                        ) {
                            Text(
                                text = "العودة إلى أبنائي",
                                fontFamily = TajawalFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }

            "profile" -> {
                // Child Profile Screen (Figma App.tsx `Profile`)
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    item {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            IconButton(onClick = { activeSubScreen = "list" }) {
                                Text(
                                    text = "‹",
                                    fontSize = 32.sp,
                                    color = SaraPurple,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Text(
                                text = "ملف الطفل",
                                fontFamily = CairoFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 20.sp,
                                color = SaraDeepPurple
                            )
                        }
                    }

                    // Profile Identity Card
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(64.dp)
                                        .clip(CircleShape)
                                ) {
                                    Image(
                                        painter = painterResource(id = selectedChildImage),
                                        contentDescription = selectedChildName,
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )
                                }

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = selectedChildName,
                                        fontFamily = CairoFontFamily,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 18.sp,
                                        color = SaraInk
                                    )
                                    Text(
                                        text = "$selectedChildAge • الدولة: $newChildCountry",
                                        fontFamily = TajawalFontFamily,
                                        fontSize = 12.sp,
                                        color = SaraMuted
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(99.dp))
                                            .background(SaraLavender)
                                            .padding(horizontal = 10.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = "طالب متميز 🌟",
                                            fontFamily = TajawalFontFamily,
                                            fontSize = 9.sp,
                                            color = SaraPurple,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Subscription Status Card
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "حالة الاشتراك",
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(99.dp))
                                        .background(Color(0xFFD1FAE5))
                                        .padding(horizontal = 14.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "نشط ومفعّل ✓",
                                        fontFamily = TajawalFontFamily,
                                        color = Color(0xFF065F46),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }

                    // Next Class Card
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "حصته القادمة",
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "السبت 10:00 ص — لغة عربية ونور البيان مع مس سارة",
                                    fontFamily = TajawalFontFamily,
                                    fontSize = 12.sp,
                                    color = SaraMuted
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                Button(
                                    onClick = { viewModel.setPortal(PortalTab.CLASSROOM) },
                                    colors = ButtonDefaults.buttonColors(containerColor = SaraPurple),
                                    shape = RoundedCornerShape(999.dp)
                                ) {
                                    Text("دخول الفصل المباشر 🎥", fontFamily = TajawalFontFamily, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    // Level & Progress Card
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "البرنامج والمستوى",
                                    fontFamily = TajawalFontFamily,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "دبلوم السوروبان والحساب الذهني • المستوى الأول",
                                    fontFamily = TajawalFontFamily,
                                    fontSize = 12.sp,
                                    color = SaraMuted
                                )
                                Spacer(modifier = Modifier.height(8.dp))
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
                                    text = "إنجاز 75% من المتطلبات",
                                    fontFamily = TajawalFontFamily,
                                    fontSize = 10.sp,
                                    color = SaraPurple,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // Open Child Experience
                    item {
                        Button(
                            onClick = { viewModel.setPortal(PortalTab.LEARNER) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = SaraGold,
                                contentColor = SaraDeepPurple
                            ),
                            shape = RoundedCornerShape(999.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(46.dp)
                        ) {
                            Text(
                                text = "فتح تجربة الطفل ←",
                                fontFamily = TajawalFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                        Text(
                            text = "تجربة آمنة ومناسبة للعمر، دون بيانات مالية.",
                            fontFamily = TajawalFontFamily,
                            fontSize = 11.sp,
                            color = SaraMuted,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                        )
                    }
                }
            }

            else -> {
                // Default List Screen (Figma App.tsx `Children`)
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    item {
                        Text(
                            text = "أبنائي الأعزاء",
                            fontFamily = CairoFontFamily,
                            fontWeight = FontWeight.Bold,
                            fontSize = 24.sp,
                            color = SaraDeepPurple
                        )
                        Text(
                            text = "كل رحلة تعلم تبدأ بخطوة. تابع تجربة كل طفل في مكان واحد.",
                            fontFamily = TajawalFontFamily,
                            fontSize = 13.sp,
                            color = SaraMuted
                        )
                    }

                    // Child 1: فاطمة أحمد
                    item {
                        FigmaChildRow(
                            name = "فاطمة أحمد",
                            ageTier = "حتى 6 سنوات (مستوى الروضة)",
                            program = "تأسيس نور البيان والحساب الذهني",
                            imageRes = R.drawable.img_avatar_fatima,
                            onViewProfile = {
                                selectedChildName = "فاطمة أحمد"
                                selectedChildAge = "حتى 6 سنوات"
                                selectedChildImage = R.drawable.img_avatar_fatima
                                activeSubScreen = "profile"
                            }
                        )
                    }

                    // Child 2: علي أحمد
                    item {
                        FigmaChildRow(
                            name = "علي أحمد",
                            ageTier = "7 إلى 8 سنوات",
                            program = "دبلوم السوروبان والحساب السريع",
                            imageRes = R.drawable.img_avatar_boy,
                            onViewProfile = {
                                selectedChildName = "علي أحمد"
                                selectedChildAge = "7 إلى 8 سنوات"
                                selectedChildImage = R.drawable.img_avatar_boy
                                activeSubScreen = "profile"
                            }
                        )
                    }

                    // Child 3: محمد أحمد
                    item {
                        FigmaChildRow(
                            name = "محمد أحمد",
                            ageTier = "9 إلى 14 سنة",
                            program = "خوارزميات الحساب التخيلي Anzan المتقدمة",
                            imageRes = R.drawable.img_avatar_boy,
                            onViewProfile = {
                                selectedChildName = "محمد أحمد"
                                selectedChildAge = "9 إلى 14 سنة"
                                selectedChildImage = R.drawable.img_avatar_boy
                                activeSubScreen = "profile"
                            }
                        )
                    }

                    // Add Child Wide Button
                    item {
                        Button(
                            onClick = { activeSubScreen = "add" },
                            colors = ButtonDefaults.buttonColors(containerColor = SaraPurple),
                            shape = RoundedCornerShape(999.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(46.dp)
                                .testTag("parent_add_child_btn")
                        ) {
                            Text(
                                text = "إضافة طفل +",
                                fontFamily = TajawalFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }
                        Text(
                            text = "لن تظهر للطفل معلومات الاشتراكات أو المدفوعات.",
                            fontFamily = TajawalFontFamily,
                            fontSize = 11.sp,
                            color = SaraMuted,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun FigmaChildRow(
    name: String,
    ageTier: String,
    program: String,
    imageRes: Int,
    onViewProfile: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, SaraBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onViewProfile() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
            ) {
                Image(
                    painter = painterResource(id = imageRes),
                    contentDescription = name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = name,
                    fontFamily = CairoFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = SaraInk
                )
                Text(
                    text = ageTier,
                    fontFamily = TajawalFontFamily,
                    fontSize = 12.sp,
                    color = SaraMuted
                )
                Text(
                    text = program,
                    fontFamily = TajawalFontFamily,
                    fontSize = 11.sp,
                    color = SaraPurple
                )
                Spacer(modifier = Modifier.height(6.dp))
                Button(
                    onClick = onViewProfile,
                    colors = ButtonDefaults.buttonColors(containerColor = SaraPurple),
                    shape = RoundedCornerShape(999.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                    modifier = Modifier.height(28.dp)
                ) {
                    Text(
                        text = "عرض ملف الطفل ←",
                        fontFamily = TajawalFontFamily,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
