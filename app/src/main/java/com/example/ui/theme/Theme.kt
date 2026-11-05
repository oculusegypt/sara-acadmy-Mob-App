package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = SaraPurple,
    onPrimary = Color.White,
    primaryContainer = SaraDeepPurple,
    onPrimaryContainer = SaraGold,
    secondary = SaraGold,
    onSecondary = SaraDeepPurple,
    secondaryContainer = SaraGoldDark,
    onSecondaryContainer = Color.White,
    tertiary = PastelAquaIcon,
    background = BackgroundDark,
    surface = SurfaceDark,
    surfaceVariant = SurfaceVariantDark,
    onBackground = TextPrimaryDark,
    onSurface = TextPrimaryDark,
    onSurfaceVariant = TextSecondaryDark,
    outline = SaraPurple.copy(alpha = 0.3f)
)

private val LightColorScheme = lightColorScheme(
    primary = SaraPurple,
    onPrimary = Color.White,
    primaryContainer = SaraLavender,
    onPrimaryContainer = SaraDeepPurple,
    secondary = SaraGold,
    onSecondary = SaraDeepPurple,
    secondaryContainer = Color(0xFFFEF3C7),
    onSecondaryContainer = Color(0xFF78350F),
    tertiary = PastelMintIcon,
    background = SaraPageBg,
    surface = SurfaceLight,
    surfaceVariant = SaraLavender.copy(alpha = 0.4f),
    onBackground = SaraInk,
    onSurface = SaraInk,
    onSurfaceVariant = SaraMuted,
    outline = SaraBorder
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
