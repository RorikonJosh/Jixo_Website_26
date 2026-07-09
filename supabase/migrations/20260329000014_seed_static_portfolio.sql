-- Import built-in portfolio entries so they can be managed from Admin.

CREATE UNIQUE INDEX IF NOT EXISTS portfolio_items_image_path_key
  ON public.portfolio_items (image_path);

INSERT INTO public.portfolio_items (
  page_type,
  commission_category,
  display_date,
  sort_date,
  platform,
  external_link,
  title_zh,
  title_jp,
  title_en,
  desc_zh,
  desc_jp,
  desc_en,
  bonus_label_zh,
  bonus_label_jp,
  bonus_label_en,
  bonus_text_zh,
  bonus_text_jp,
  bonus_text_en,
  bonus_url,
  image_path,
  fullsize_path,
  published,
  featured
) VALUES
  (
    'artwork', NULL, '2026.3.29', '2026-03-29', 'Pixiv',
    'https://www.pixiv.net/artworks/142896853',
    'ロッシ', 'ロッシ', 'ロッシ',
    E'鷹角的設計很多時候真的會讓我搞不清楚該怎麼去拆解衣服會比較好(·ω·)\n真的很佩服設計師能想出這些造型\n上次伊瑪吃了大保 這次讓我少少出吧~',
    E'鷹角的設計很多時候真的會讓我搞不清楚該怎麼去拆解衣服會比較好(·ω·)\n真的很佩服設計師能想出這些造型\n上次伊瑪吃了大保 這次讓我少少出吧~',
    E'鷹角的設計很多時候真的會讓我搞不清楚該怎麼去拆解衣服會比較好(·ω·)\n真的很佩服設計師能想出這些造型\n上次伊瑪吃了大保 這次讓我少少出吧~',
    'FANBOX', 'FANBOX', 'FANBOX',
    '差分: 裸 ぶっかけ ↓7p+2p', '差分: 裸 ぶっかけ ↓7p+2p', '差分: 裸 ぶっかけ ↓7p+2p',
    'https://kareya.fanbox.cc/posts/11643246',
    'artworks/20260329.jpg', NULL, true, true
  ),
  (
    'artwork', NULL, '2026.3.8', '2026-03-08', 'Pixiv',
    'https://www.pixiv.net/artworks/142064210',
    'チャイナドレスのヒナもめちゃくちゃ可愛い！',
    'チャイナドレスのヒナもめちゃくちゃ可愛い！',
    'チャイナドレスのヒナもめちゃくちゃ可愛い！',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20260308.jpg', NULL, true, false
  ),
  (
    'artwork', NULL, '2025.12.25', '2025-12-25', 'Pixiv',
    'https://www.pixiv.net/artworks/139052431',
    '三人の静かなクリスマス', '三人の静かなクリスマス', '三人の静かなクリスマス',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20251225.jpg', NULL, true, false
  ),
  (
    'artwork', NULL, '2025.11.01', '2025-11-01', 'Pixiv',
    'https://www.pixiv.net/artworks/136977187',
    'お菓子ないなら、「白い魂」ちょうだいっ♡',
    'お菓子ないなら、「白い魂」ちょうだいっ♡',
    'お菓子ないなら、「白い魂」ちょうだいっ♡',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20251101.jpg', NULL, true, false
  ),
  (
    'artwork', NULL, '2025.10.12', '2025-10-12', 'Pixiv',
    'https://www.pixiv.net/artworks/136193149',
    '名前のない子', '名前のない子', '名前のない子',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20251012.jpg', NULL, true, false
  ),
  (
    'artwork', NULL, '2025.8.29', '2025-08-29', 'Pixiv',
    'https://www.pixiv.net/artworks/134468065',
    'やぁ、先生。お陰で今日も「楽しい」一日になりそうだ',
    'やぁ、先生。お陰で今日も「楽しい」一日になりそうだ',
    'やぁ、先生。お陰で今日も「楽しい」一日になりそうだ',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20250829.jpg', NULL, true, false
  ),
  (
    'artwork', NULL, '2025.8.10', '2025-08-10', 'Pixiv',
    'https://www.pixiv.net/artworks/133721266',
    'こんな時はどうすればいいのか、よく分からなくて、ごめん',
    'こんな時はどうすればいいのか、よく分からなくて、ごめん',
    'こんな時はどうすればいいのか、よく分からなくて、ごめん',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20250810.jpg', NULL, true, false
  ),
  (
    'artwork', NULL, '2025.6.22', '2025-06-22', 'Pixiv',
    'https://www.pixiv.net/artworks/131853848',
    '……本当に、夢みたいです……せんせえ……ありがとうございます',
    '……本当に、夢みたいです……せんせえ……ありがとうございます',
    '……本当に、夢みたいです……せんせえ……ありがとうございます',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20250622.jpg', NULL, true, false
  ),
  (
    'artwork', NULL, '2025.4.7', '2025-04-07', 'Pixiv',
    'https://www.pixiv.net/artworks/129068611',
    '「本気を出すわよ——燃え尽きても知らないんだからっ！」',
    '「本気を出すわよ——燃え尽きても知らないんだからっ！」',
    '「本気を出すわよ——燃え尽きても知らないんだからっ！」',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20250407.jpg', NULL, true, false
  ),
  (
    'artwork', NULL, '2024.10.31', '2024-10-31', 'Pixiv',
    'https://www.pixiv.net/artworks/123857704',
    '「先生がいくらお菓子をくれても無駄だよ」',
    '「先生がいくらお菓子をくれても無駄だよ」',
    '「先生がいくらお菓子をくれても無駄だよ」',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20241031.jpg', NULL, true, false
  ),
  (
    'artwork', NULL, '2024.10.19', '2024-10-19', 'Pixiv',
    'https://www.pixiv.net/artworks/123482185',
    '「先生、少し暑くはないかの？」',
    '「先生、少し暑くはないかの？」',
    '「先生、少し暑くはないかの？」',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20241019.jpg', NULL, true, false
  ),
  (
    'artwork', NULL, '2024.9.27', '2024-09-27', 'Pixiv',
    'https://www.pixiv.net/artworks/122816028',
    '「先生、キキを抱っこしてくれませんか？お願い！お願い！」',
    '「先生、キキを抱っこしてくれませんか？お願い！お願い！」',
    '「先生、キキを抱っこしてくれませんか？お願い！お願い！」',
    '', '', '', '', '', '', '', '', '', '',
    'artworks/20240927.jpg', NULL, true, false
  ),
  (
    'commission', 'general', '2025.10.24', '2025-10-24', NULL,
    'https://www.pixiv.net/artworks/136649323',
    'あら～遅いじゃない❤ タイヤ暖めてるの？優しいんだね～♡',
    'あら～遅いじゃない❤ タイヤ暖めてるの？優しいんだね～♡',
    'あら～遅いじゃない❤ タイヤ暖めてるの？優しいんだね～♡',
    E'感謝 安弟 的委託\n以前就很喜歡這隻了 過了這麼久能畫得更好了\n這張RQ精靈小鬼的想法我真的覺得超讚 各處細節都很認真地畫了\n跟上次一樣 我要求了讓我多畫點差分:D',
    E'感謝 安弟 的委託\n以前就很喜歡這隻了 過了這麼久能畫得更好了\n這張RQ精靈小鬼的想法我真的覺得超讚 各處細節都很認真地畫了\n跟上次一樣 我要求了讓我多畫點差分:D',
    E'感謝 安弟 的委託\n以前就很喜歡這隻了 過了這麼久能畫得更好了\n這張RQ精靈小鬼的想法我真的覺得超讚 各處細節都很認真地畫了\n跟上次一樣 我要求了讓我多畫點差分:D',
    'FANBOX', 'FANBOX', 'FANBOX',
    '差分:溢れ精液 下脱ぎ  ※ 放尿 注意!↓8p+2p',
    '差分:溢れ精液 下脱ぎ  ※ 放尿 注意!↓8p+2p',
    '差分:溢れ精液 下脱ぎ  ※ 放尿 注意!↓8p+2p',
    'https://kareya.fanbox.cc/posts/10785924',
    'commissions/general/20251024.jpg',
    'commissions/general/fullsize/20251024_FULL.jpg',
    true, true
  ),
  (
    'commission', 'general', '2025.08.23', '2025-08-23', NULL,
    '#',
    '2025.08.23', '2025.08.23', '2025.08.23',
    '', '', '', '', '', '', '', '', '', '',
    'commissions/general/20250823.png',
    'commissions/general/fullsize/20250823_FULL.png',
    true, false
  ),
  (
    'commission', 'r18', '2025.11.23', '2025-11-23', NULL,
    'https://www.pixiv.net/artworks/137812779',
    '今日は退屈ね~', '今日は退屈ね~', '今日は退屈ね~',
    E'感謝 馬鈴薯 的委託\n很認真地畫了這次的委託\n加了很多感覺有趣的生活小物品\n模仿了些畫比較成熟角色的繪師畫風 感覺比較適合\n顏色的感覺很好 又進步了點個感覺\n地上的是掃地機器米娘獸 之前也有很多不同型態的米娘獸 大家可以找看看',
    E'感謝 馬鈴薯 的委託\n很認真地畫了這次的委託\n加了很多感覺有趣的生活小物品\n模仿了些畫比較成熟角色的繪師畫風 感覺比較適合\n顏色的感覺很好 又進步了點個感覺\n地上的是掃地機器米娘獸 之前也有很多不同型態的米娘獸 大家可以找看看',
    E'感謝 馬鈴薯 的委託\n很認真地畫了這次的委託\n加了很多感覺有趣的生活小物品\n模仿了些畫比較成熟角色的繪師畫風 感覺比較適合\n顏色的感覺很好 又進步了點個感覺\n地上的是掃地機器米娘獸 之前也有很多不同型態的米娘獸 大家可以找看看',
    'FANBOX', 'FANBOX', 'FANBOX',
    '差分:裸  衣装変更↓6p', '差分:裸  衣装変更↓6p', '差分:裸  衣装変更↓6p',
    'https://kareya.fanbox.cc/posts/10947258',
    'commissions/r18/20251123.jpg',
    'commissions/r18/fullsize/20251123_FULL.jpg',
    true, true
  ),
  (
    'commission', 'r18', '2025.07.25', '2025-07-25', NULL,
    'https://www.pixiv.net/artworks/133106188',
    'シャンプーいたずら', 'シャンプーいたずら', 'シャンプーいたずら',
    '感謝 josh 的委託。沒想到會有回頭客，當下接到時超開心的。而且還是這麼讚的主題，所以就畫了一堆差分。我也認為是時候了…',
    '感謝 josh 的委託。沒想到會有回頭客，當下接到時超開心的。而且還是這麼讚的主題，所以就畫了一堆差分。我也認為是時候了…',
    '感謝 josh 的委託。沒想到會有回頭客，當下接到時超開心的。而且還是這麼讚的主題，所以就畫了一堆差分。我也認為是時候了…',
    'FANBOX、fantia 同步', 'FANBOX、fantia 同步', 'FANBOX、fantia 同步',
    '※ふたなり注意!↓', '※ふたなり注意!↓', '※ふたなり注意!↓',
    'https://kareya.fanbox.cc/posts/10279616',
    'commissions/r18/20250725.jpg',
    'commissions/r18/fullsize/20250725_FULL.jpg',
    true, false
  )
ON CONFLICT (image_path) DO NOTHING;
