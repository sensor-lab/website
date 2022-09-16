<h1>网页钢琴</h1>
<h3>演示视频</h3>
<p>下面的视频展示了锐客创新嵌入式平台的一个简单应用-网页钢琴。</p>
<p>每个不同的音阶有对应的频率。通过嵌入式平台向蜂鸣器发送特定频率的电信号，蜂鸣器即可发出对应的音阶。</p>
<!-- https://www.bilibili.com/read/cv6775208 -->
<iframe src="//player.bilibili.com/player.html?aid=382524557&bvid=BV1GZ4y1B79d&cid=559816490&page=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="550" height="400"> </iframe>

<h3>音符对应不同的频率</h3>
<div class="demos-content-paragraph">
<p>每个音符对应着一个特定的频率。在这个项目中，想要发出的音符是:do, #do, re, #re, mi, fa, #fa, so, #so, la, #la, ti, do, 一共十三个音符，对应的频率为261.63Hz, 277.18Hz, 293.66Hz, 311.13Hz, 329.63Hz, 349.23Hz, 369.99Hz, 392Hz, 415.30Hz, 440Hz, 466.16Hz, 493.88Hz和523.25Hz。</p>
<p>请参考<a href="https://www.zhihu.com/question/27661883/answer/37545330">音符和频率的对应表</a>。</p>
</div>

<h3>蜂鸣器工作原理</h3>
<div class="demos-content-paragraph">
<p><a href="https://baike.baidu.com/item/%E8%9C%82%E9%B8%A3%E5%99%A8/3326617#:~:text=%E8%9C%82%E9%B8%A3%E5%99%A8%E6%98%AF%E4%B8%80,%E2%80%9CJD%E2%80%9D%E7%AD%89%EF%BC%89%E8%A1%A8%E7%A4%BA%E3%80%82">蜂鸣器</a>是一种电子元件，里面有一块金属片叫蜂鸣片，当在蜂鸣片上加不同的电压时，蜂鸣片会产生形变。当形变交替产生并按某个频率时，即可产生声音。如果我们想要听到Do(261.63Hz)的音符，我们只需要让蜂鸣器在一秒中产生261.63*2，即523次形变。</p>
<blockquote>
这里需要乘以2是因为一个周期蜂鸣片的形状改变两次，第一次从原状态变为其他状态，第二次变回原状态。
</blockquote>
</div>
<h3>PWM控制</h3>
<div class="demos-content-paragraph">
<p><a href="https://baike.baidu.com/item/%E8%84%89%E5%86%B2%E5%AE%BD%E5%BA%A6%E8%B0%83%E5%88%B6/10813756?fromtitle=PWM&fromid=3034961&fr=aladdin">PWM</a>广泛用于电子领域，PWM的全称为Pulse-Width Modulation，即一种可以调节周期(频率)和占空比的信号发生方式。</p>
<p>这个项目使用PWM发出特定频率的方波，当蜂鸣器接受到方波后，便可根据方波的频率发出对应的音符。</p>
<blockquote>
如果我们需要产生261.63Hz的音符Do，方波的周期为1/261.63=0.003793秒，即3793微秒。
</blockquote>
<p>蜂鸣器的音量可由占空比控制，当蜂鸣片在原状态和其他状态停留的时间基本一样时，发出的音量最大。反之，如果原状态和其他状态停留的时间差别越大，那么发出的音量越小。反映到PWM的控制上，当我们把占空比设置为50%，音量最大; 反之占空比越小，音量越小。</p>
<p>我们选择使用嵌入式平台的PWM1，通道A，平台和蜂鸣器的连接如下图：</p>
<img src="/img/webpage_piano_demo/buzzer_connection.png" style="max-width: 800px; height:auto" alt="">
</div>

<h3>网站页面</h3>
<div class="demos-content-paragraph">
<p>用户可以将下方链接中的文件保存到SD卡中的<b>public</b>文件夹，当平台上电后，通过浏览器访问平台，即可使用网页钢琴。</p>
<a href="/download/webpage_piano_demo/webpage_piano_index.html" download="index.html">下载：网页钢琴－网站页面</a>
<br><br>
<p><b>index.html</b>里每个音符的定义在<b>tone_map</b>对象中，比如la的定义为2272us，即周期为2272微秒，初始的占空比为1500/2272=66%。用户可以通过音量键改变占空比。每次按键的发声时间为0.3秒。</p>
<pre>
la: {
  unit: 'us',
  period: 2272,
  duration_a: 1500,
  duration_b: 0,
  duration_c: 0,
  running_time: 30
}
</pre>

<p>通过硬件控制命令可以方便地向嵌入式平台发送请求。代码如下：</p>
<pre>
body = {
  'event': 'now',
  'actions': [['pwm', 1, 'enabled', this.tone_map[tone].unit, this.tone_map[tone].period, parseInt(this.tone_map[tone].period * 0.5 * volumn / 100),
              this.tone_map[tone].duration_b, this.tone_map[tone].duration_c, this.tone_map[tone].running_time]]
}
try {
  const response = await fetch(request, {
      method: 'post',
      body: JSON.stringify(body)
  }).then(response => response.text())
  .then(response => {
      document.getElementById('mainResponse').innerHTML += timerHelpers.responseDisplay(response);
  });
  } catch(err) {
      console.error(`Error: ${err}`);
  }
}
</pre>

</div>
