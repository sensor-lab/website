# 运行框图

<img style="max-width: 750px; height: auto; " src="img/Structure.png"/>
<br>

<p>上图描述了锐客创新嵌入式平台的典型应用。用户从以太网或SD卡输入指令，开发板根据指令会发送硬件操作命令给执行器，比如开启电机转动。当执行器完成任务后，开发板发送硬件操作命令给传感器，收集传感器的数据。最后返回结果。</p>

# 通过以太网与系统交互

## 连接

用户可以根据使用场景将平台接入网络，以下是推荐的两种连接方式：

<ol>
<li>
<p>将硬件平台接入路由器网络，计算机即可通过路由器访问硬件平台。</p>
<br>
<img style="max-width: 550px; height: auto; " src="img/RouterConnection.png"/>
</li>
<li>
<p>将硬件平台直接和计算机连接，即可通过计算机直接访问硬件平台。</p>
<br>
<img style="max-width: 550px; height: auto; " src="img/LaptopConnection.png"/>
</li>
</ol>

<blockquote>
对于计算机和硬件平台直接连接的情况，目前大多数以太网接口可以识别出Tx和Rx，因此不需要使用交叉网线即可实现通信。
</blockquote>

## 通信

<p>当硬件平台接入网络后，用户即可以和平台进行通信。客户端通过HTTP请求可以实现和硬件平台的交互，支持以下两种HTTP请求</p>
<ol>
<li>静态网站：用户可将前端页面存在SD卡上的<b>public</b>文件夹。当通过浏览器访问硬件平台时，平台会自动加载<b>public</b>文件夹中的<b>index.html</b>文件，继而可以向用户展示前端页面。</li>
<li>硬件操作命令：用户还可发送HTTP的POST请求到硬件平台，根据请求内容的不同，硬件平台可以进行相应的硬件操作，比如GPIO的设置，ADC采样等。POST请求需要发送到URI为<b>/hardware/operation</b>。请求的内容必须为JSON格式。</li>
</ol>

<blockquote>
<p>对于Linux用户，可以使用<a href="http://ipcmen.com/curl">curl命令</a>或使用<a href="https://ipcmen.com/ping">ping命令</a>和硬件进行基本的通信。</p>
<p>对于Windows用户，可以使用<a href="https://www.postman.com/">postman</a>和硬件进行基本的通信</p>
</blockquote>

<p>如果平台通过DHCP协议从所在网络中得到IP地址等信息，用户可以通过登录路由器配置页面或通过串口的IP地址命令得到硬件平台的IP地址; 如果用户提前设置了静态IP地址，子网掩码，网关地址信息，用户可直接通过IP地址访问硬件平台(这里需要将静态IP地址设置在同一个网络)。</p>
<blockquote>
<p>当时用静态IP地址，子网掩码和网管地址。用户需要确定硬件平台和路由器或计算机在同一个网络。请考虑以下的两种情况：</p>
<p>当使用静态IP地址且硬件平台和计算机直接通过以太网连接时，用户可以手动的设置计算机的网络信息。比如硬件平台的静态IP地址为192.168.1.1，这时，用户可以将计算机的IP地址设置为192.168.1.2，即可进行通信。</p>
<p>当使用静态IP地址且硬件平台连接在路由器网络中时，用户需要确定路由器网络的IP地址并将硬件平台设置在同一个网络中。</p>
</blockquote>

<p>硬件平台的IP地址设置为192.168.1.107，使用以下的ping命令和硬件平台通信，确保网络链路通畅</p>

<pre>
$ ping 192.168.1.107
PING 192.168.1.107 (192.168.1.107) 56(84) bytes of data.
64 bytes from 192.168.1.107: icmp_seq=1 ttl=128 time=0.415 ms
64 bytes from 192.168.1.107: icmp_seq=2 ttl=128 time=0.490 ms
</pre>

<p>以下的curl命令用来模拟浏览器访问硬件平台，平台会将<b>index.html</b>返回给浏览器</p>

```
curl --location --request GET '192.168.1.107'

返回：
index.html的内容
```

<p>以下的curl命令发送一条GPIO硬件操作语言，硬件平台将引脚0设置为<b>输出高电平</b>。</p>

```
curl --location --request POST '192.168.1.107/hardware/operation' \
--header 'Content-Type: application/json' \
--data-raw '{
  "event":"now",
  "actions": [["gpio",0, "output", 1]]
}'

返回：
{"event":"now","result":[[1]]}
```

# SD 卡与系统交互

<p>除了通过串口连接线和以太网，用户还可以通过SD卡和系统进行交互。</p>
<p>用户可将系统配置文件，硬件操作文件存在SD卡上，这些文件同样可以改变硬件平台的行为。</p>
<blockquote>
这里需要说明的是，SD卡目前只支持FAT32文件系统，且块的大小为固定的512字节。
</blockquote>

<p>下面对SD上的文件夹进行说明：</p>
<ol>
<li>public：该文件夹保存所有的静态网站相关的文件，包括HTML, CSS, JS等，当用户使用浏览器访问该系统时，系统会将静态文件返回给浏览器，浏览器进而可以显示页面。</li>
<li>user：该文件夹保存所有用户的文件，比如用户通过HTTP请求在SD上保存一个文件，该文件会被保存到该文件夹。除此之外，该文件夹还保存系统的初始化硬件命令文件<b>boot.json</b></li>
<li>system：该文件夹保存系统文件，包括系统的配置文件<b>config.json</b>，和系统的日志<b>syslog</b></li>
<li>firmware：该文件夹保存系统的固件，如果我们发布了新的固件版本且用户希望升级固件，用户可自行下载固件，然后将固件命名为<b>firmware.hex</b>并保存在该文件夹中。当下次系统上电后，系统会检测到新的固件文件，并做系统升级。</li>
</ol>

## boot.json 文件

<p>boot.json保存在<b>user</b>文件夹中，内容和以太网HTTP的硬件操作命令一样，采用JSON格式。当系统上电后，会自动读取该文件，按照文件的内容做出相应的硬件操作。</p>
<p>例如，将以下内容保存到boot.json文件中，当系统上电后，会每5秒钟读取ADC的采样，然后通过UDP发送给IP地址192.168.1.105的5000端口。</p>

```
{
  "event":"schedule",
  "interval":"5s",
  "actions": [["adc",0, "5v"]],
  "return": ["udp","192.168.1.105:5000"]
}
```

<blockquote>
更多的硬件操作命令，请参考后面的内容。
</blockquote>

# 硬件操作，事件处理和结果返回

<p>下图是对发送到硬件平台的数据包的简单说明：</p>
<br>
<img style="max-width: 350px; height: auto; " src="img/HttpRequest.png"/>
<br>

## 硬件操作

<p>嵌入式平台支持对GPIO，ADC，SPI，I2C，UART，PWM，时钟模块，文件系统的硬件操作。</p>
<p>硬件操作保存在JSON格式中，用户通过HTTP的POST请求发送给平台，或通过保存在user/boot.json文件中。</p>

<p>以下是一个例子：</p>

<pre>
{
  "event":"now",
  "actions": [["gpio",0, "output", 1]]
}
</pre>

<p>可以注意到，上面的例子中的JSON对象有两个键，一个是"event"，一个是"actions"。</p>

<ul>
<li>event: 事件类型，可以为"now","schedule"或"pinstate"。下面有详细的说明。</li>
<li>actions: 硬件操作，该键对应的值为数组，数组里可包含多个硬件操作，而每个硬件操作写在一个单独的数组中。</li>
</ul>

<a href="download/锐客创新硬件操作命令.pdf" download="锐客创新硬件操作命令.pdf">下载：【硬件操作命令集】</a>

## 事件处理

<p>硬件平台的事件处理机制帮助用户选择在特定条件下触发硬件操作。</p>
<ul>
<li>当事件类型为"now"时，平台接受到请求时会立即执行里面的硬件命令。</li>
<li>当事件类型为"schedule"时，平台接受到请求时会根据里面的信息在合适的时间触发硬件命令。</li>
<li>当事件类型为"pinstate"时，平台接受到请求时会配置相应的管脚，只有当管教电平满足条件时，才会出发硬件命令。</li>
</ul>

##### now 事件：

<p>该事件会即刻发送，发送包里的硬件操作会即可进行执行。格式如下：</p>

<pre>
{
  "event":"now",
  "actions": [["硬件操作_1"], ["硬件操作_2"], ...]
}

//将管脚0的电压进行反转：
{
  "event":"now",
  "actions": [["gpio", 0, "output", 2]]
}

//读取管脚0和1的电压状态，然后再读取ADC0的采样：
{
  "event":"now",
  "actions": [["gpio", 0, "input", 0], ["gpio", 1, "input", 0], ["adc", 0, "5v"]]
}
</pre>

##### schedule 事件

<p>该事件定义事件发生时间要求，当系统检测到满足时间要求时，硬件事件会被自动触发</p>

<pre>
{
  "event":"schedule",
  "interval":"重复间隔"(必填)
  "start":"起始时间" (可选)
  "end":"结束时间" (可选)
  "actions": [["硬件操作_1"], ["硬件操作_2"], ...]
}

说明：
1. "重复间隔": 必填参数。必须有时间单位量，目前支持：'s'(秒), 'm'(分钟), 'h'(小时) 和 'd'(天)
2. "起始时间": 选填参数。必须满足日期时间格式: "YYYY/MM/DD HH:MM:SS" (比如: "2020/11/28 15:30:0")
3. "结束时间": 选填参数。必须满足日期时间格式: "YYYY/MM/DD HH:MM:SS" (比如: "2020/11/29 0:10:0")

比如如下请求将管脚0的电压进行反转，而且每5秒钟反转一次，从2020/1/1 的下午两点进行到下午四点。
{
  "event":"schedule",
  "interval":"5s",
  "start":"2020/1/1 14:00:00",
  "end":"2020/1/1 16:00:00",
  "actions": [["gpio", 0, "output",2]]
}
</pre>

<blockquote>
<p>如果用户没有指定起始时间和结束时间，硬件操作会立即以间隔被不停地触发。</p>
<p>如果用户只指定了起始时间，硬件操作会在起始时间后以间隔被不停地触发。</p>
<p>如果用户只制定了结束时间，则硬件操作会立即以间隔被不停地触发直到结束时间。</p>
</blockquote>

##### pinstate 事件

<p>该事件定义当指定引脚的电压发生改变时，则硬件操作会被触发。</p>
<p>改变包括上升沿，下降沿或任何电压改变。格式如下：</p>

<pre>
{
  "event": "pinstate",
  "pin": "管脚名称", (必填)
  "trigger": "触发条件", (必填)
  "actions": [["硬件操作_1"], ["硬件操作_2"], ...]
}

说明：
1. pin目前支持: 26 / 27 / 28 / 29
2. trigger支持：change/rising/falling，change即在管脚发生电压改变时触发，rising即在管脚上升沿触发，falling即在管脚下降沿触发。

例如，在26上升沿时，反转管脚10的电压:
{
  "event": "pinstate",
  "pin": 26,
  "trigger": "rising",
  "actions": [["gpio",10,"output",2]]
}
</pre>

## 结果返回

<p>用户可以提供返回信息，当硬件操作结束后，所有的返回值会发送给指定的目的地。</p>
<p>在JSON请求中加入<b>return</b>键来指定某个特定返回地址</p>
<p>目前支持如下三种返回类型：</p>

##### tcp

<p>指定一个IP地址，当硬件操作结束后，结果会通过TCP发送到该IP地址</p>

```
{
  ...
  "return": ["tcp", "IP地址:端口号"]
}

比如，下面的例子是一个now事件，当引脚0的电压翻转后，结果不但会返回给发送方，还会通过tcp的方式发送给IP地址192.168.1.110，端口5050：
{
  "event":"now",
  "actions": [["gpio", 0, "output", 2]]
  "return": ["tcp", "192.168.1.110:5050"]
}

```

##### udp

<p>指定一个IP地址，当硬件操作结束后，结果会通过UDP发送到该IP地址</p>

```
{
  ...
  "return": ["udp", "IP地址:端口号"]
}

比如，下面的例子是一个schedule事件，每5秒会进行一个ADC采样，每次采样结束后，结果会通过udp的方式发送给IP地址192.168.1.110，端口8001：
{
  "event":"schedule",
  "interval": "5s",
  "actions": [["adc", 0, "5v"]]
  "return": ["udp", "192.168.1.110:8001"]
}
```

##### 文件

<p>指定一个文件名，当硬件操作结束后，结果会保存到该文件中。</p>

<blockquote>
该文件会默认保存到user文件夹中。
</blockquote>

```
{
  ...
  "return": ["file", "文件名"]
}

比如，下面的例子是一个schedule事件，每5秒会进行一个ADC采样，每次采样结束后，结果会保存到adc_sample.txt文件中。
用户可读取SD卡，访问/user/adc_sample.txt来获得采样结果：

{
  "event":"schedule",
  "interval": "5s",
  "actions": [["adc", 0, "5v"]]
  "return": ["file", "adc_sample.txt"]
}
```
