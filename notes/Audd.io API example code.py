import requests
data = {
    'api_token': 'test',
    'return': 'apple_music,spotify',
}
files = {
    'file': open('C:\\Users\\Chris\\Desktop\\Recording 15s.m4a', 'rb'),
}
result = requests.post('https://api.audd.io/', data=data, files=files)
print(result.text)
k=input("press close to exit") 


