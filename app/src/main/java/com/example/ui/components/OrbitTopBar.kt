package com.example.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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
import com.example.data.models.User
import com.example.ui.theme.*

@Composable
fun OrbitTopBar(
    currentUser: User?,
    onOpenAuth: () -> Unit,
    onOpenBooking: () -> Unit,
    onOpenVerifier: () -> Unit,
    notificationCount: Int = 3
) {
    Surface(
        color = SaraPageBg,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(72.dp)
                    .padding(horizontal = 18.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // 1. Notification Action Button with Badge (Left in LTR, Right in RTL)
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .clickable { onOpenBooking() }
                        .testTag("top_notifications_btn"),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_header_bell),
                        contentDescription = "الإشعارات",
                        tint = SaraPurple,
                        modifier = Modifier.size(24.dp)
                    )

                    if (notificationCount > 0) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .offset(x = (-2).dp, y = 4.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFFFCE3F5))
                                .padding(horizontal = 5.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "$notificationCount",
                                color = Color(0xFFD84B58),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = TajawalFontFamily
                            )
                        }
                    }
                }

                // 2. Centered Brand Lockup (Logo + سارة العربي + منصة تعليمية متكاملة)
                Column(
                    modifier = Modifier
                        .clickable { onOpenVerifier() }
                        .testTag("top_brand_lockup"),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.img_sara_logo),
                        contentDescription = "سارة العربي",
                        modifier = Modifier.height(28.dp),
                        contentScale = ContentScale.Fit
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "سارة العربي",
                        fontFamily = CairoFontFamily,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = SaraDeepPurple,
                        lineHeight = 17.sp
                    )
                    Text(
                        text = "منصة تعليمية متكاملة",
                        fontFamily = TajawalFontFamily,
                        fontWeight = FontWeight.Bold,
                        fontSize = 9.sp,
                        color = SaraMuted,
                        lineHeight = 11.sp
                    )
                }

                // 3. Parent Profile Avatar with Chevron
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(24.dp))
                        .clickable { onOpenAuth() }
                        .padding(horizontal = 4.dp, vertical = 4.dp)
                        .testTag("top_parent_profile_btn"),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .border(1.5.dp, SaraPurple.copy(alpha = 0.3f), CircleShape)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.img_avatar_parent),
                            contentDescription = "حساب ولي الأمر",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }

                    Spacer(modifier = Modifier.width(4.dp))

                    Text(
                        text = "‹",
                        color = SaraPurple,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 2.dp)
                    )
                }
            }
        }
    }
}
