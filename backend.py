from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

uploaded_videos = {}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload_video', methods=['POST'])
def upload_video():
    video_file = request.files.get('video_file')
    subtitles_data = request.json.get('subtitles')

    # Save video file
    video_path = f"uploads/{video_file.filename}"
    video_file.save(video_path)

    # Save subtitles data
    subtitles_file_path = f"uploads/{video_file.filename.split('.')[0]}.srt"
    with open(subtitles_file_path, 'w') as subtitles_file:
        for subtitle in subtitles_data:
            subtitles_file.write(f"{subtitle['timestamp']} --> {subtitle['timestamp'] + 2}\n{subtitle['text']}\n\n")

    # Associate video with subtitles file
    uploaded_videos[video_path] = subtitles_file_path

    return jsonify({'message': 'Video and subtitles uploaded successfully'})


@app.route('/get_subtitles/<path:video_path>', methods=['GET'])
def get_subtitles(video_path):
    subtitles_file_path = uploaded_videos.get(video_path)

    if subtitles_file_path:
        with open(subtitles_file_path, 'r') as subtitles_file:
            subtitles_data = subtitles_file.read()

        return subtitles_data

    return jsonify({'error': 'Video not found'})


if __name__ == '__main__':
    app.run(debug=True)
