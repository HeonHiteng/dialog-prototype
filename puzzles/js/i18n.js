/* UI strings. Sinhala & Tamil are first drafts — have a native speaker review before launch. */
(function (root) {
  var S = {
    en: {
      appTitle: 'Daily Puzzles', tagline: 'Three new puzzles every day · Free to play',
      play: 'Play', continue: 'Continue', solved: 'Solved', streak: 'Streak', best: 'Best', played: 'Played',
      nextIn: 'Next puzzle in', share: 'Share', whatsapp: 'WhatsApp', copied: 'Copied to clipboard!',
      howTo: 'How to play', gotIt: "Let's go!", moves: 'Moves', par: 'Par', time: 'Time', undo: 'Undo',
      reset: 'Restart', back: 'Back', close: 'Close', puzzleNo: 'Puzzle #{n}', allDone: 'All three done today — see you tomorrow!',
      rewardTitle: 'Daily streak', rewardBody: 'Finish all 3 puzzles for {n} days in a row to unlock a reward.',
      rewardDays: '{d}/{n} days', diff: ['Hard', 'Easy', 'Easy+', 'Medium', 'Medium+', 'Tricky', 'Hard'],
      // Rush
      rushName: 'Tuk-Tuk Rush', rushDesc: 'Clear the Colombo junction gridlock.',
      rushHow: ['Drag vehicles along their lane — they only move forwards or backwards.',
        'Clear a path so the red tuk-tuk can exit on the right.',
        'Every slide counts as one move, however far it goes. Match par for ★★★.'],
      rushWin: 'Tuk-tuk is free!', rushExit: 'EXIT',
      // Mines
      minesName: 'Pothole Patrol', minesDesc: 'Find every pothole — pure logic, no guessing.',
      minesHow: ['Tap a tile to inspect the road. A number shows how many potholes touch it (diagonals too).',
        'Long-press — or switch to 🚧 mode — to mark a pothole with a cone.',
        'Every puzzle can be solved by logic alone. You never have to guess.',
        'Hitting a pothole adds a 30-second penalty.'],
      minesLeft: 'Potholes', mistakes: 'Mistakes', modeDig: 'Inspect', modeFlag: 'Cone', minesWin: 'Road is safe!',
      penalty: '+30s penalty!',
      // Olinda
      olindaName: 'Olinda: Grand Sweep', olindaDesc: 'Plan the perfect Avurudu sowing combo.',
      olindaHow: ['Tap one of YOUR pits (bottom row) to pick up its seeds and sow them one by one, anticlockwise.',
        'When your hand is empty, scoop up the NEXT pit and keep sowing.',
        'If the next pit is empty, you capture the pit after it — and keep sweeping across further empty gaps.',
        'Pasu: any pit that reaches 4 seeds goes to that row’s owner (top row = lost!).',
        'Capture the target in the moves given. There is exactly one way.'],
      target: 'Target', movesLeft: 'Moves left', haul: 'Your haul', lost: 'Lost', tries: 'Try', skip: 'Skip ▸▸',
      olindaGoal: 'Capture {t} seeds in {m} moves', olindaFail: '{c} of {t} — not quite. Undo or try again!',
      tryAgain: 'Try again', reveal: 'Show solution', revealed: 'Solution shown', olindaWin: 'Grand Sweep!',
      yourRow: 'Your pits', theirRow: 'Opponent’s pits'
    },
    si: {
      appTitle: 'දෛනික ප්‍රහේලිකා', tagline: 'සෑම දිනකම නව ප්‍රහේලිකා තුනක් · නොමිලේ',
      play: 'ක්‍රීඩා කරන්න', continue: 'දිගටම', solved: 'විසඳුවා', streak: 'අඛණ්ඩ', best: 'හොඳම', played: 'ක්‍රීඩා කළ',
      nextIn: 'ඊළඟ ප්‍රහේලිකාව', share: 'බෙදාගන්න', whatsapp: 'WhatsApp', copied: 'පිටපත් කළා!',
      howTo: 'ක්‍රීඩා කරන ආකාරය', gotIt: 'පටන් ගමු!', moves: 'චලන', par: 'ඉලක්කය', time: 'කාලය', undo: 'අහෝසි',
      reset: 'නැවත', back: 'ආපසු', close: 'වසන්න', puzzleNo: 'ප්‍රහේලිකාව #{n}', allDone: 'අද තුනම අවසන් — හෙට හමුවෙමු!',
      rewardTitle: 'දෛනික අඛණ්ඩතාව', rewardBody: 'ත්‍යාගයක් ලබා ගැනීමට දින {n}ක් අඛණ්ඩව ප්‍රහේලිකා 3ම විසඳන්න.',
      rewardDays: 'දින {d}/{n}', diff: ['අමාරු', 'පහසු', 'පහසු+', 'මධ්‍යම', 'මධ්‍යම+', 'උපක්‍රමශීලී', 'අමාරු'],
      rushName: 'Tuk-Tuk Rush', rushDesc: 'කොළඹ මංසන්ධියේ තදබදය නිදහස් කරන්න.',
      rushHow: ['වාහන ඒවායේ මංතීරුව දිගේ ඇදගෙන යන්න — ඒවාට යා හැක්කේ ඉදිරියට හෝ පසුපසට පමණි.',
        'රතු ත්‍රීරෝද රථයට දකුණු පසින් පිටවීමට මඟ පාදන්න.',
        'කොතරම් දුර ගියත් සෑම ලිස්සීමක්ම එක් චලනයකි. ★★★ සඳහා ඉලක්කයට සමාන චලන ගණනකින් විසඳන්න.'],
      rushWin: 'ත්‍රීරෝද රථය නිදහස්!', rushExit: 'පිටවීම',
      minesName: 'Pothole Patrol', minesDesc: 'සියලු වළවල් සොයන්න — තර්කය පමණයි, අනුමාන නැත.',
      minesHow: ['පාර පරීක්ෂා කිරීමට කොටුවක් තට්ටු කරන්න. අංකයෙන් පෙන්වන්නේ එය ස්පර්ශ කරන වළවල් ගණනයි (විකර්ණ ද ඇතුළුව).',
        'වළක් කේතුවකින් සලකුණු කිරීමට දිගු වේලාවක් ඔබන්න, නැතහොත් 🚧 ප්‍රකාරයට මාරු වන්න.',
        'සෑම ප්‍රහේලිකාවක්ම තර්කයෙන් පමණක් විසඳිය හැක. අනුමාන කිරීමට අවශ්‍ය නැත.',
        'වළකට වැටුණොත් තත්පර 30ක දඩයක් එකතු වේ.'],
      minesLeft: 'වළවල්', mistakes: 'වැරදි', modeDig: 'පරීක්ෂා', modeFlag: 'කේතුව', minesWin: 'පාර ආරක්ෂිතයි!',
      penalty: '+තත්පර 30 දඩය!',
      olindaName: 'Olinda: Grand Sweep', olindaDesc: 'පරිපූර්ණ අවුරුදු ඔලිඳ චලනය සැලසුම් කරන්න.',
      olindaHow: ['ඔබේ වළකින් (පහළ පේළිය) ඇට ගෙන, වාමාවර්තව එකින් එක දමන්න.',
        'අත හිස් වූ විට, ඊළඟ වළේ ඇට ගෙන දිගටම දමන්න.',
        'ඊළඟ වළ හිස් නම්, ඊට පසු වළේ ඇට ඔබට හිමියි — තවත් හිස් වළවල් හරහා දිගටම අතුගාන්න.',
        'පසු: ඇට 4ක් වූ වළ එම පේළියේ හිමිකරුට යයි (ඉහළ පේළිය = අහිමියි!).',
        'දී ඇති චලන ගණනින් ඉලක්කය අල්ලා ගන්න. ඇත්තේ එක් විසඳුමක් පමණි.'],
      target: 'ඉලක්කය', movesLeft: 'ඉතිරි චලන', haul: 'ඔබේ ඇට', lost: 'අහිමි', tries: 'වාරය', skip: 'මඟහරින්න ▸▸',
      olindaGoal: 'චලන {m}කින් ඇට {t}ක් අල්ලා ගන්න', olindaFail: '{t}න් {c}යි — තව ටිකයි. අහෝසි කරන්න හෝ නැවත උත්සාහ කරන්න!',
      tryAgain: 'නැවත උත්සාහ කරන්න', reveal: 'විසඳුම පෙන්වන්න', revealed: 'විසඳුම පෙන්වා ඇත', olindaWin: 'Grand Sweep!',
      yourRow: 'ඔබේ වළවල්', theirRow: 'විරුද්ධවාදියාගේ වළවල්'
    },
    ta: {
      appTitle: 'தினசரி புதிர்கள்', tagline: 'ஒவ்வொரு நாளும் மூன்று புதிய புதிர்கள் · இலவசம்',
      play: 'விளையாடு', continue: 'தொடரவும்', solved: 'தீர்க்கப்பட்டது', streak: 'தொடர்', best: 'சிறந்தது', played: 'விளையாடியவை',
      nextIn: 'அடுத்த புதிர்', share: 'பகிர்', whatsapp: 'WhatsApp', copied: 'நகலெடுக்கப்பட்டது!',
      howTo: 'எப்படி விளையாடுவது', gotIt: 'தொடங்குவோம்!', moves: 'நகர்வுகள்', par: 'இலக்கு', time: 'நேரம்', undo: 'செயல்தவிர்',
      reset: 'மீண்டும்', back: 'பின்', close: 'மூடு', puzzleNo: 'புதிர் #{n}', allDone: 'இன்றைய மூன்றும் முடிந்தது — நாளை சந்திப்போம்!',
      rewardTitle: 'தினசரி தொடர்', rewardBody: 'பரிசைப் பெற தொடர்ந்து {n} நாட்கள் மூன்று புதிர்களையும் முடியுங்கள்.',
      rewardDays: '{d}/{n} நாட்கள்', diff: ['கடினம்', 'எளிது', 'எளிது+', 'நடுத்தரம்', 'நடுத்தரம்+', 'சவால்', 'கடினம்'],
      rushName: 'Tuk-Tuk Rush', rushDesc: 'கொழும்பு சந்தியின் நெரிசலை விடுவியுங்கள்.',
      rushHow: ['வாகனங்களை அவற்றின் பாதையில் இழுங்கள் — அவை முன்னோ பின்னோ மட்டுமே செல்லும்.',
        'சிவப்பு முச்சக்கர வண்டி வலப்புறம் வெளியேற வழி அமைத்துக் கொடுங்கள்.',
        'எவ்வளவு தூரம் நகர்ந்தாலும் ஒவ்வொரு நகர்வும் ஒன்றாகக் கணக்கிடப்படும். ★★★ பெற இலக்கு எண்ணிக்கையில் முடியுங்கள்.'],
      rushWin: 'டுக்-டுக் விடுதலை!', rushExit: 'வெளியே',
      minesName: 'Pothole Patrol', minesDesc: 'எல்லாக் குழிகளையும் கண்டுபிடியுங்கள் — தர்க்கம் மட்டும், ஊகம் இல்லை.',
      minesHow: ['சாலையைச் சோதிக்க ஒரு கட்டத்தைத் தட்டுங்கள். எண், அதைத் தொடும் குழிகளின் எண்ணிக்கையைக் காட்டும் (மூலைவிட்டங்கள் உட்பட).',
        'குழியைக் கூம்பால் குறிக்க நீண்ட நேரம் அழுத்துங்கள், அல்லது 🚧 முறைக்கு மாறுங்கள்.',
        'ஒவ்வொரு புதிரையும் தர்க்கத்தால் மட்டுமே தீர்க்கலாம். ஊகிக்கத் தேவையில்லை.',
        'குழியில் விழுந்தால் 30 வினாடி அபராதம்.'],
      minesLeft: 'குழிகள்', mistakes: 'தவறுகள்', modeDig: 'சோதி', modeFlag: 'கூம்பு', minesWin: 'சாலை பாதுகாப்பானது!',
      penalty: '+30 வினாடி அபராதம்!',
      olindaName: 'Olinda: Grand Sweep', olindaDesc: 'சிறந்த பல்லாங்குழி நகர்வுத் தொடரைத் திட்டமிடுங்கள்.',
      olindaHow: ['உங்கள் குழிகளில் ஒன்றைத் (கீழ் வரிசை) தட்டி, அதன் விதைகளை எடுத்து, கடிகார எதிர்த்திசையில் ஒவ்வொன்றாக இடுங்கள்.',
        'கை காலியானதும், அடுத்த குழியின் விதைகளை எடுத்துத் தொடர்ந்து இடுங்கள்.',
        'அடுத்த குழி காலியாக இருந்தால், அதற்கு அடுத்த குழியைக் கைப்பற்றுவீர்கள் — மேலும் காலி இடைவெளிகளைத் தாண்டித் தொடர்ந்து அள்ளுங்கள்.',
        'பசு: 4 விதைகளை அடையும் குழி அந்த வரிசையின் உரிமையாளருக்குச் செல்லும் (மேல் வரிசை = இழப்பு!).',
        'கொடுக்கப்பட்ட நகர்வுகளில் இலக்கை அடையுங்கள். ஒரே ஒரு வழிதான் உள்ளது.'],
      target: 'இலக்கு', movesLeft: 'மீதி நகர்வுகள்', haul: 'உங்கள் விதைகள்', lost: 'இழப்பு', tries: 'முயற்சி', skip: 'தவிர் ▸▸',
      olindaGoal: '{m} நகர்வுகளில் {t} விதைகளைக் கைப்பற்றுங்கள்', olindaFail: '{t} இல் {c} — கொஞ்சம் குறைவு. செயல்தவிர்க்கவும் அல்லது மீண்டும் முயலவும்!',
      tryAgain: 'மீண்டும் முயல்க', reveal: 'தீர்வைக் காட்டு', revealed: 'தீர்வு காட்டப்பட்டது', olindaWin: 'Grand Sweep!',
      yourRow: 'உங்கள் குழிகள்', theirRow: 'எதிராளியின் குழிகள்'
    }
  };
  var DP = root.DP = root.DP || {};
  DP.LANGS = { en: 'EN', si: 'සිං', ta: 'தமி' };
  DP.lang = (function () { try { return localStorage.getItem('dp:lang') || 'en'; } catch (e) { return 'en'; } })();
  DP.t = function (k, vars) {
    var v = (S[DP.lang] && S[DP.lang][k]) || S.en[k] || k;
    if (vars && typeof v === 'string') v = v.replace(/\{(\w+)\}/g, function (_, x) { return vars[x]; });
    return v;
  };
  DP.setLang = function (l) { DP.lang = l; try { localStorage.setItem('dp:lang', l); } catch (e) {} document.documentElement.lang = l; };
})(this);
