var node_ssh, ssh, site_dir, static_dir,filename,path
node_ssh = require('node-ssh')
path = require('path')
ssh = new node_ssh()
site_dir = '/www/wwwroot/headlines_project'
static_dir = '../headlines_project/'

// 连接
ssh.connect({
        host: '192.168.5.147',
        username: 'root',
        privateKey: 'C:\\Users\\86150\\.ssh\\id_rsa'
}).then(function () {
    // 上传本地目录中的文件到远程服务器
    uploadDist();
    // console.log('ssh连接成功')
})


// 上传静态资源
function uploadDist() {
    console.log('静态资源上传中....')
    // 上传目录
    ssh.putDirectory(static_dir, site_dir,{
        recursive: true,
        concurrency: 10,
        // ^ WARNING: Not all servers support high concurrency
        // try a bunch of values and see what works on your server
        validate: function(itemPath) {
          const baseName = path.basename(itemPath)
          return baseName.substr(0, 1) !== '.' && // do not allow dot files
                 baseName !== 'node_modules'  // do not allow node_modules
        },
        tick: function(localPath, remotePath, error) {
          if (error) {
            failed.push(localPath)
          } else {
            successful.push(localPath)
          }
        }
      }).then(function () {
        console.log("上传成功")
        process.exit()
    }, function (error) {
        console.error("错误信息：" + error.message)
    })
}
