import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'
const UserInfoKey = 'vue_admin_template_user_info'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  console.log('setToken - 要保存的token:', token)
  try {
    const result = Cookies.set(TokenKey, token, { 
      expires: 7, // 7天过期
      path: '/',
      sameSite: 'strict'
    })
    console.log('setToken - 保存结果:', result)
    
    // 立即验证是否保存成功
    const saved = Cookies.get(TokenKey)
    console.log('setToken - 立即验证保存的token:', saved)
    return result
  } catch (e) {
    console.error('setToken - 保存失败:', e)
    return false
  }
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getUserInfo() {
  const userInfo = Cookies.get(UserInfoKey)
  console.log('getUserInfo - 从cookie读取的原始数据:', userInfo)
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo)
      console.log('getUserInfo - 解析后的数据:', parsed)
      
      // 尝试从localStorage获取照片
      const photo = localStorage.getItem('user_photo')
      if (photo) {
        parsed.photo = photo
        console.log('getUserInfo - 从localStorage获取到照片')
      }
      
      return parsed
    } catch (e) {
      console.error('getUserInfo - JSON解析失败:', e)
      return null
    }
  }
  return null
}

export function setUserInfo(userInfo) {
  console.log('setUserInfo - 要保存的数据:', userInfo)
  try {
    // 分离照片数据，避免cookie过大
    const { photo, ...userInfoWithoutPhoto } = userInfo
    
    // 保存基本信息到cookie
    const result = Cookies.set(UserInfoKey, JSON.stringify(userInfoWithoutPhoto), { 
      expires: 7, // 7天过期
      path: '/',
      sameSite: 'strict'
    })
    console.log('setUserInfo - 保存结果:', result)
    
    // 如果有照片数据，保存到localStorage
    if (photo) {
      localStorage.setItem('user_photo', photo)
      console.log('setUserInfo - 照片已保存到localStorage')
    }
    
    // 立即验证是否保存成功
    const saved = Cookies.get(UserInfoKey)
    console.log('setUserInfo - 立即验证保存的数据:', saved)
    return result
  } catch (e) {
    console.error('setUserInfo - 保存失败:', e)
    return false
  }
}

export function removeUserInfo() {
  Cookies.remove(UserInfoKey)
  localStorage.removeItem('user_photo')
  console.log('removeUserInfo - 已清除cookie和localStorage中的用户信息')
}
