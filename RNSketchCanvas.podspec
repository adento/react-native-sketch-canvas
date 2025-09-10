require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'RNSketchCanvas'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = 'https://github.com/terrylinla/react-native-sketch-canvas'
  s.license      = package['license']
  s.authors      = package['author']
  s.source       = { :git => package['repository']['url'] }
  s.platform     = :ios, '13.4'
  s.source_files = 'ios/**/*.{h,m}'
  
  # React Native 0.74+ compatibility
  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency 'React-Core'
  end
  
  # New architecture support
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }
end
