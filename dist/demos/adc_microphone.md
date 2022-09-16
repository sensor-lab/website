<h1>声音录制与分析系统</h1>
<h3>演示视频</h3>
<p>下面的视频展示了由嵌入式平台搭建的声音录制与分析系统。用喇叭播放音符C3和A4组合，平台连接外部麦克风，然后连续地对麦克风的输出进行采样(模数转换(ADC)采样)并保存声音，并通过傅立叶变换得到声音的频率信息。C3的频率为261Hz，A4的频率为440Hz。在频谱分析的图示中，可以看到最高的值对应的频率为440Hz和261Hz。</p>
<iframe src="//player.bilibili.com/player.html?aid=600597188&bvid=BV15B4y1H71o&cid=763172812&page=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

<h3>硬件设备连接</h3>
<div class="demos-content-paragraph">
<p>当对着麦克风唱歌时，产生的声音使膜片振动，与膜片相连的线圈也跟着一起振动，线圈在磁场中切割磁感线，能产生随着声音变化而变化的电流，继而在输出端产生对应变化的电压。</p>
<p>将麦克风的输出端和嵌入式平台的模数转换(ADC)接口连接，然后通过电脑端的Python脚本向平台发送硬件控制命令进行模数转换采样。随着采样的进行，平台将采样结果发送回电脑端。</p>
<p>当收到所有的采样结果后，电脑端将结果保存成WAV文件，用户可播放该WAV文件并听到所采集的声音。并且电脑端通过Python的SciPy库，对收集到的声音进行傅立叶分析，可得到声音的频谱分析数据。</p>
<p>麦克风基于MAX9814模块，请点击<a href="https://s.taobao.com/search?q=MAX9814&type=p&tmhkh5=&from=sea_1_searchbutton&catId=100&spm=a2141.241046-.searchbar.d_2_searchbox">该淘宝链接</a>购买麦克风模块，该模块大概15元左右。</p>
</div>

<img src="/img/adc_microphone/connections.png" style="max-width: 400px; height:auto" alt="">

<h3>ADC采样</h3>
<div class="demos-content-paragraph">
<p>锐客创新嵌入式平台支持ADC单次或连续采样。对于连续采样，平台支持采样频率从1到2000Hz。该声音录制系统使用2000Hz的采样频率，5V的参考电压。</p>
<blockquote>
采样频率越高，记录声音的清晰度越高。我们常说的无损音乐的采样率需达到44.1kHz。2000Hz采样率虽然不高，但能够听得清楚一般的谈话内容。
</blockquote>
<p>通过Python的Requests库，可以方便地向嵌入式平台发送硬件操作语言。</p>
<pre>
payload_obj = {
    "event": "now",
    "actions": [["adc", adc_channel_id, adc_ref_voltage, sample_rate, "s", duration, \
                return_type_str, return_dest_str]]
}

ret = requests.post(f'http://{rectcream_ip}/hardware/operation', json=payload_obj)
</pre>
<p>在发送硬件操作语言之前，电脑端需要打开指定的网络端口，用来接受平台的采样结果。平台会将采样结果保存在1460字节的缓存中。当缓存存满后，平台会将缓存发送给电脑端。Python脚本使用了asyncore库，用来非阻塞地接收采样结果。</p>
<a href="/download/adc_microphone/adc_microphone.py" download="adc_microphone.py">下载：Python参考脚本</a>
</br>
</br>
<p>该脚本中为了显示中文字符，需要加载ttf中文字符库，点击下面的链接下载中文字符库。</p>
<a href="/download/adc_microphone/AaKaiSong.ttf" download="AaKaiSong.ttf">中文字符库</a>
</br>
</br>
<p>对于脚本中用到的其他Python库，请通过<b>pip</b>下载。</p>
</div>

<h3>声音频谱分析</h3>
<div class="demos-content-paragraph">
<p>该<a href="/download/adc_microphone/sound.wav" download="sound.wav">WAV文件</a>中记录了采集到的结果。可播放该文件听到录制到的内容。</p>
<p>电脑端可以对采样结果进行傅立叶变换，即可将结果从时域信号转换为频域信号。根据<a href="https://baike.baidu.com/item/%E9%87%87%E6%A0%B7%E5%AE%9A%E7%90%86/8599843?fromtitle=%E5%A5%88%E5%A5%8E%E6%96%AF%E7%89%B9%E9%87%87%E6%A0%B7%E5%AE%9A%E7%90%86&fromid=11173466&fr=aladdin">奈奎斯特采样定理</a>，当采样频率为2000Hz时，可以检测出从1-1000Hz的信号。因此2000Hz的采样频率足够检测出喇叭中播放音符的C3(261Hz)和A4(440Hz)。</p>
<p>请参考下图，在频谱分析的图示中，可以看到最高的值对应的频率为440Hz和261Hz。</p>
</div>
<img src="/img/adc_microphone/waveform_and_fft.png" style="max-width: 800px; height:auto" alt="">

