<h1>LED灯带控制器</h1>
<h3>演示视频</h3>
<div class="demos-content-paragraph">
<p>下面的视频展示了由嵌入式平台搭建的LED灯带控制器。灯带基于WS2811控制芯片，灯带中每个WS2811连接一个RGB LED。嵌入式平台根据WS2811的手册，将一共24位的红，绿，蓝(每个颜色各8位)信息发送给灯带中的控制器，控制器继而通过PWM波控制对应的颜色。后面会对WS2811和平台相关的控制进行详细地介绍。用户通过网页端控制灯带中LED亮的个数和颜色，还可以设置动态更新效果让LED灯带闪烁。</p>
</div>
<iframe src="//player.bilibili.com/player.html?aid=386029129&bvid=BV1jd4y1Q7v5&cid=775707691&page=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"  width="550" height="400"> </iframe>

<h3>LED灯带连接</h3>
<div class="demos-content-paragraph">
<p>目前比较流行有基于WS2811或者WS2812的灯带。两种灯带的控制方式相似，都是由三个管脚分别控制电源，地和信号。WS2812的时序会比WS2811快一些; 两种灯带都可以选择不同的输入电压，比如5V, 12V等，更高的电压会提供灯带更强的亮度。该项目使用的是基于WS2811的灯带，输入电压为5V。但平台同时还支持WS2812和其他输入电压，用户需要用命令配置平台即可。</p>
<p>下图展示了嵌入式平台和灯带的连接。为了方便，这里直接用迷你测试钩连接平台的相应管脚和灯带。</p>
<img src="/img/led_strip_control/connections.png" style="max-width: 600px; height:auto" alt="">
<img src="/img/led_strip_control/led_strip_photo.png" style="max-width: 600px; height:auto" alt="">
<h4>WS2811介绍</h4>
<p>首先需要了解RGB LED，下图展示了一个RGB LED，它有四个管脚分别控制红色，绿色，蓝色和地。如果想要它发出红光，需要将红色的信号设置为高电平，并将绿色和蓝色的信号设置为低电平；如果想要它发出黄光，需要将红色和绿色的设置为高电平，并将蓝色的信号设置为低电平。更进一步，控制信号可以使用PWM控制，这样通过调节不同的周期和占空比，可以调节每种颜色的亮度，进而组合出更多的颜色。</p>
<p>一般LED的驱动电流为20mA到40mA，正向导通电压约为2.4V。如果要用5V的电源来点亮这个RGB LED，还需要在RGB的每一个管脚上串联一个约100欧母的电阻。否则会因为电流过大烧掉。</p>
<img src="/img/led_strip_control/rgb_led.jpeg" style="max-width: 300px; height:auto" alt="">
<p>上面介绍了RGB LED的原理，而WS2811可以方便地控制RGB LED，我们只需要将想要的颜色通过逻辑电平的方式发送给它，它会继而对每个颜色进行PWM控制，同时我们也不需要担心连接电阻。</p>
<p>淘宝有很多基于该控制器的灯带，读者可以自行选择购买。<a href="https://s.taobao.com/search?q=WS2811&imgfile=&js=1&stats_click=search_radio_all%3A1&initiative_id=staobaoz_20220718&ie=utf8">淘宝链接</a></p>
<p>点击<a href="https://item.szlcsc.com/115825.html">该链接</a>下载WS2811的技术手册。</p>
<h4>WS2811管脚</h4>
<p>WS2811的管脚及解释如下图：</p>
<img src="/img/led_strip_control/ws2811_pinout.png" style="max-width: 600px; height:auto" alt="">
<ul>
<li>OUTR/OUTG/OUTB：输出端口。输出PWM，来控制每种颜色的亮度和不同颜色的组合。</li>
<li>DIN：数据输入端口。主控将红色，绿色，蓝色信息发送到该端口。在芯片处理完信息后，改变OUTR/OUTG/OUTB的输出信号。</li>
<li>DOUT：数据输出端口。用于将颜色信息发送给下一个串联的WS2811，实现多个LED的控制。</li>
</ul>
<h4>WS2811协议</h4>
<p>为了将红色，蓝色和绿色的信息发送给WS2811，信号需要满足其给定的协议，内容如下图：</p>
<img src="/img/led_strip_control/ws2811_protocol.png" style="max-width: 600px; height:auto" alt="">
<img src="/img/led_strip_control/ws2811_protocol_2.png" style="max-width: 600px; height:auto" alt="">
<p>0.5微秒的高电平和2微秒的低电平代表逻辑0，1.2微秒的高电平和1.3微秒的低电平代表逻辑1。比如想要设置红色的值为0xA3，需要按照这种高低电平的方式将逻辑序列10100011发送给WS2811。</p>

<p>WS2811一个很重要的功能是，它可以进行串联，继而控制多个LED。在上图的数据传输方法一图中，如果每个24比特发送的间隔小于复位时间(50微秒)，那么控制芯片会将接下来的信号从DOUT端口发出，如果DOUT端口连接着下一个控制芯片的DIN，那么即可控制下一个LED。</p>

<h4>Advance Output硬件操作</h3>
<p>嵌入式开发平台提供了Advance Output即高级输出功能，该功能可以重新定义逻辑1和0的产生方式。比如可以定义1为高电平10微秒然后低电平20微秒;0为高电平50微秒，低电平80微秒。那么接下来数据都会依照该定义在高级输出端口产生对应的电平信号。</p>
<p>比如，下面的命令将逻辑1定义为长度为2.5微秒，高电平1.2微秒；逻辑0定义为长度2.5微秒，高电平0.5微秒。然后以该定义在高级输出端口发送105, 105, 105 (设置LED为白光)。</p>
<pre>
curl --location --request POST "$RECTCREAM_IP/hardware/operation" --header 'Content-Type: application/json' --data-raw '{
    "event":"now",
    "actions": [["advanceoutput", 0, "setup", "one", "us", 2.5, 1.2],["advanceoutput", 0, "setup", "zero", "us", 2.5, 0.5],["advanceoutput", 0, "start", 8, 3, 105, 105, 105]]
  }'
</pre>
<p>更详细的Advance Output硬件操作信息，请从文档页面下载硬件操作命令集。</p>
<div>

<h3>网站页面</h3>
<p>当硬件连接完成后，加载下面的前端页面到SD卡的Public文件夹中，通过浏览器打开页面，即可实现控制。</p>
<a href="/download/led_strip_control/index.html" download="index.html">下载：灯带控制器－网站页面</a>
<br>
<a href="/download/led_strip_control/header.png" download="header.png">下载：灯带控制器－背景图片</a>
<br>
<p>用户可以打开页面，选择灯的数量和想要的颜色。也可以设置闪烁的颜色和闪烁的速度。</p>
<img src="/img/led_strip_control/led_strip_website.png" style="max-width: 800px; height:auto" alt="">

