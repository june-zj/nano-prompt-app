<template>
  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-credits">
          <p>素材来源</p>
          <div class="footer-links">
            <a
              href="https://glidea.github.io/banana-prompt-quicker/#"
              target="_blank"
              >Banana Prompt Quicker</a
            >
            <a
              href="https://mp.weixin.qq.com/s/lrYNbs4rGs3KOqewoZ6aNQ"
              target="_blank"
              >微信公众号文章</a
            >
          </div>
        </div>
        <div class="footer-qrcodes">
          <div class="qrcode-item">
            <img :src="developerGroupQR" alt="开发者群" />
            <p>开发者群</p>
          </div>
          <div class="qrcode-item">
            <img :src="customerServiceQR" alt="开发者&客服" />
            <p>开发者&客服</p>
          </div>
        </div>
      </div>
      <div class="footer-copyright">
        <p>© 2024 Nano Banana Pro. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
  props: {
    developerGroupQR: {
      type: String,
      default: "",
    },
    customerServiceQR: {
      type: String,
      default: "",
    },
  },
};
</script>
