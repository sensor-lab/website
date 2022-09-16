<h1>比赛记分显示系统</h1>
<h3>演示视频</h3>
<p>下面的视频展示了由嵌入式平台搭建的比赛记分显示系统。平台连接外接的显示板，裁判通过前端页面控制显示板为每个选手显示分数。一块显示板由两个七段数码管和一个74HC595位移缓存器组成，多个显示板可串联在一起，平台可分别控制每个显示板。通过修改前端页面，系统可为任意个数的运动员显示分数。</p>
<iframe src="//player.bilibili.com/player.html?aid=471763842&bvid=BV11T411L7qf&cid=796799752&page=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="550" height="400"> </iframe>

<h3>显示板电路</h3>
<h5>七段数码管</h5>
<div class="demos-content-paragraph">
<p>七段数码管模块里面由8个LED组成，如下图所示。当在a脚加相应的电压，com脚接地，图中所示为a的LED会被点亮。以此类推，通过在不同的管脚上加电压，可点亮任意的LED。</p>
<img src="/img/point_counter/7_segment_display_unit.png" style="max-width: 400px; height:auto" alt="">
<p>七段数码管分为两种，一种是共阴极数码管，另一种是共阳极数码管。两种唯一的不同是共阴极数码管的公共端接地，在LED管脚上加正电压来点亮LED; 共阳极数码管的公共端接正电压，当LED管脚接地时会点亮LED。</p>
</p>这个项目使用的是共阳极数码管HDSP3601，点击链接下载<a href="/download/points_counter/HDSP3601_datasheet.pdf">HDSP3601技术手册</a>。</p>
<p>关于数码管，除了需要了解如何点亮各个LED，还需要关注它的电气特性，特别是数码管的正向导通电压和正向导通电流，这两个参数可以告诉我们该数码管需要加多少电压可以点亮，在点亮之后流过数码管的电流是多少。</p>
<p>下面的截图来自HDSP3601技术手册，正向导通电压为2.2V，该电压下的正向导通电流为20mA。因为平台的输出端为5V，且高于正向导通电压2.2V，如果将5V直接加在数码管上，会损坏数码管。所以这里需要串联一个电阻。</p>
<p>串联电阻值的选择可以根据欧母定律得出。在串联电阻之后，电阻两端的电压为5-2.2=2.8V。如果想保证20mA的电流从电阻流到数码管，需要2.8/0.02=140欧母。即最小的电阻为140欧母。</p>
<p>实际情况中，在达到正向导通电压后，电流并不需要达到正向导通电流也能够点亮数码管，且亮度没有很大的区别。根据测试，这里选择的串联电阻为1k欧母，即电流约为2.8/1000=2.8mA。</p>
<img src="/img/point_counter/forward_voltage.png" style="max-width: 700px; height:auto" alt="">
</div>

<h5>74HC595位移缓存器</h5>
<div class="demos-content-paragraph">
<p>一个七段数码管有八个LED，我们可以为每个LED分配一个GPIO，即可控制任意LED的点亮。但是如果要控制多个数码管，那么这种方法就不可行，因为平台没有那么多的GPIO。</p>
<p>因此这里使用74HC595位移缓存器，它只需要用两个串行输入管脚即可控制八个输出管脚。同时，多个位移寄存器还可以级联在一起，即可用两个串行输入管脚控制多个位移寄存器。</p>
<p>点击下载<a href="/download/points_counter/sn74hc595.pdf">74HC595技术手册</a></p>
<b>触发器</b>
<p>74HC595由触发器(FlipFlop)组成，触发器是构成现在计算机的基石之一。下图所以：</p>
<img src="/img/point_counter/flip-flop.png" style="max-width: 600px; height:auto" alt="">
<p>当没有时钟时，触发器会保持已经存储的信号(0或1)。</p>
<p>当有时钟发生时(上升沿)，触发器会根据S端和R端的信号(S端为1,R端为0时，进而存储1到触发器中;反之存储0)，更新存储在触发器中的信号，并在输出端输出。</p>
<p>74HC595的每一个管脚用途如下：</p>
<ul>
<li>OE: 输出使能端，拉低可让缓存进行输出。显示板将其一直拉低输出。</li>
<li>RCLK: 寄存器时钟信号，时钟上升沿可输出寄存器存储的信号。在所有的数据都加载到74HC595后，嵌入式平台的GPIO会在这个管教产生一个上升沿，进行数据输出。</li>
<li>SRCLR: 串行寄存器(SR)的清零信号，低点平可将穿行寄存器清零。嵌入式平台的GPIO会在每次数据加载之前进行串行寄存器清零。</li>
<li>SRCLK: 串行时钟信号，连接嵌入式平台的SPI接口的时钟端。<li>
<li>SER: 串行信号，连接平台SPI接口的MOSI端。</li>
</ul>
</div>

<h5>电路连接</h5>
<div class="demos-content-paragraph">
<p>如下图所示，为七段数码显示板电路图，每块板子包含两个七段数码管和两个位移寄存器。显示板之间可以串联，这样平台便可控制多个任意数量的数码管了。</p>
<img src="/img/point_counter/point_counter_sch.png" style="max-width: 800px; height:auto" alt="">
<br>
<br>
<br>
<blockquote>
这里问一个小问题，为什么我们不能只在七段数码管的ANODE端(公共端)串联一个电阻，而是需要在每个LED端串联电阻？
<br>
<br>
原因是如果只在ANODE端串联一个电阻，当只有一个LED亮时，亮度没有问题，当所有八个LED都亮时，亮度会变暗。当只有一个LED点亮时，它经过的电阻是1000欧母，而如果八个LED都点亮时，相当与每个LED串联8000欧母(欧母定律)，所以亮度会变暗。
</blockquote>
<p>下图为嵌入式平台和显示板电路的连接。</p>
<img src="/img/point_counter/point_counter_illustration.png" style="max-width: 600px; height:auto" alt="">
</div>

<h3>比赛积分页面</h3>
<div class="demos-content-paragraph">
<p>将前端页面存储在SD卡上，当裁判点击主队/客队的得分时，前端页面会显示各队得分，并且分数也会显示到主客队的显示板上。</p>
<p>以下的硬件操作语言用于控制七段数码管。这里GPIO1连接SRCLR信号而GPIO0连接RCLK信号。</p>
<pre>
let body = {
        'event': 'now',
        'actions': [['gpio',1,'output',0],['gpio',1,'output',1],action,['gpio',0, 'output',1],['gpio',0, 'output',0]]
    }
    try {
        const response = await fetch(request, {
        method: 'post',
        body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(response => {
        console.log(response)
        })
    } catch(err) {
        console.error(`Error: ${err}`);
    }
</pre>
<a href="/download/points_counter/index.html" download="index.html">下载： 比赛积分系统－网站页面</a>
<br>
<img src="/img/point_counter/webpage.png" style="max-width: 800px; height:auto" alt="">
<div>
