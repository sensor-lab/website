<h1>自动浇花系统</h1>
<h3>演示视频</h3>
<p>下面的视频展示由嵌入式平台搭建的自动浇花系统。</p>
<p>网站端控制嵌入式平台输出9伏电压驱动水泵。除了控制水泵，平台还连接温度湿度传感器，可以从传感器中每5秒读取温度和湿度的信息，并展示到网站上。</p>
<iframe src="//player.bilibili.com/player.html?aid=297791458&bvid=BV1HF411s73T&cid=564731789&page=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="550" height="400"> </iframe>

<h3>项目图示</h3>
<img src="/img/watering_system_demo/自动浇花系统2_labelled.png" style="max-width: 800px; height:auto" alt="">
<div class="demos-content-paragraph">
<ol>
<li>嵌入式平台: 锐客创新嵌入式平台，USB Type-C供电，以太网和外界通信，杜邦线连接外设。</li>
<li>温度湿度传感器: 使用dht22温度湿度传感器。在嵌入式平台设置合适的硬件操作语言和该传感器进行交互。</li>
<li>水泵: 内部为一个额定电压为12V的无刷电机。嵌入式平台提供5/9/15/20V电压，这里我们选择9V对水泵供电。</li>
<li>继电器: 通过GPIO管脚控制9V供电，即可以控制水泵的开启和关闭。</li>
<li>接线端子: 起连接杜邦线和固定的作用。</li>
</ol>
</div>

<h3>控制水泵</h3>
<div class="demos-content-paragraph">
<p>水泵里有一个无刷电机。当接入直流电时，电机转动，继而带动水流流动，可将水流从低的地方带到高的地方。</p>
<p>继电器的控制端连接一个GPIO引脚(继电器的3和4引脚)，输出端(继电器的1和2引脚)分别连接水泵的高电压端和嵌入式平台的高电压输出端。这样继电器便可以控制开关水泵了。</p>
<h5>选择嵌入式平台输出9V电压</h5>
<p>嵌入式平台可以输出5/9/15/20V电压，用户需要在SD卡上的<b>system/config.json</b>文件中指定9V电压，如下:</p>
<pre>
{
  "voltage": "9v"
}
</pre>
<h5>GPIO开关水泵</h5>
<p>如果嵌入式平台的高电压输出直接连接到水泵，那么平台将无法控制水泵的开关。所以平台的高电压输出端先连接到继电器，通过GPIO的高低电压实现控制继电器的开关，继而控制水泵。</p>
<p>嵌入式平台的引脚1和继电器连接，可以通过下面的硬件操作语言可以实现水泵开启5秒然后关闭。</p>
<pre>
{
    'event': 'now',
    'actions': [["gpio", 1, "output", 1],["delay", 0, "s", 5],["gpio", 1, "output", 0]]
}
</pre>
</div>
<h3>控制温度湿度传感器</h3>
<div class="demos-content-paragraph">
<p>嵌入式平台通过GPIO引脚连接dht22传感器读取温度和湿度的信息。传感器有自己的通信协议，该协议规定了如何和传感器交互并从中读取温度和湿度的信息。平台可以通过硬件操作语言实现协议并得到传感器温度和湿度的数据。下面的链接是dht22的手册：</p>
<a href="/download/watering_system_demo/dht22-中文文档.pdf" download="dht22-中文文档.pdf">下载：DHT22手册</a>
<p>下图是dht22的引脚信息，VCC和GND分别和平台的5V和GND连接，DOUT引脚传送数据和平台的GPIO引脚0连接。</p>
<img src="/img/watering_system_demo/dht22引脚信息.png" style="max-width: 800px; height:auto" alt="">
<p>下图是通信协议，dht22在收到响应信号后，会先发送16位的湿度信息，然后发送16位的温度信息，最后发送校验位。</p>
<img src="/img/watering_system_demo/dht22协议.png" style="max-width: 800px; height:auto" alt="">
<p>下图展示了dht22的响应信号，平台需要将信号线拉低1毫秒，然后释放总线(即平台将信号引脚设置为输入)。</p>
<img src="/img/watering_system_demo/dht22响应信号.png" style="max-width: 400px; height:auto" alt="">
<p>下图是dht22的数据信号，如果是信号0，dht22会拉高数据信号26us，如果是信号1，dht22会拉高数据信号70us。</p>
<img src="/img/watering_system_demo/dht22数据.png" style="max-width: 400px; height:auto" alt="">
<h5>通过硬件操作语言实现协议</h5>
<p>下面的硬件操作语言实现了上面描述的dht22通信协议:</p>
<pre>
body = {
    'event': 'now',
    'actions': [["gpio", 0, "output", 0],["delay", 0, "ms", 1],["onewire", 0, "us", 10, 170]]
}
</pre>
<p>第一个硬件操作语言拉低gpio的引脚0，第二个硬件操作语言会等待1ms。这两个硬件操作语言实现了dht22的起始信号。</p>
<p>第三个硬件操作语言在数据信号上每10us捕获一次电平信号，一共捕获170次。如果是信号0，dht22会拉高数据信号26us，如果是信号1，dht2会拉高数据信号70us。当收到该硬件操作语言的结果，如果在结果中有连续两个或只有一个'1'，则为信号0，如果在结果中有超过两个'1'，则为信号1。网站端的JavaScript会处理结果并将温度和湿度信息显示到用户端。</p>
</div>

<h3>网站页面</h3>
<img src="/img/watering_system_demo/webapp1.png" style="max-width: 200px; height:auto" alt="">
<img src="/img/watering_system_demo/webapp2.png" style="max-width: 200px; height:auto" alt="">
<p>用户可以将下方链接中的文件保存到SD卡中的<b>public</b>文件夹，当平台上电后，通过浏览器访问平台，即可使用该自动浇花系统。</p>
<a href="/download/watering_system_demo/index.html" download="index.html">下载：自动浇花系统－网站页面</a>
<br><br>
<div class="demos-content-paragraph">
<p>在index.html中，用户可以查看<b>getTemperatureHumidity</b>函数了解如何从dht22中获得温度和湿度的信息。查看<b>wateringOnce</b>函数了解如何驱动水泵进行单次浇水。查看<b>wateringScheudle</b>函数了解如何实现水泵的定时浇水。</p>

</div>

