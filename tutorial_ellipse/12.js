//: HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">12. Finishing Touches III: Dynamic Movement</h2>
<p class="mb-4">Finally, let's set our cosmic dance in motion! We're adding sinusoidal movement to each ellipse, creating a hypnotic, pulsating effect. It's like watching a galaxy breathe!</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">sin(frameCount * 3.1 + 45) * 45 + 0</code>: This creates a unique, rhythmic movement for each ellipse.</li>
        <li>Each <code class="bg-gray-200 px-1 rounded">drawTheCircle()</code> call now has different parameters, giving each ellipse its own 'orbit'.</li>
        <li>The use of <code class="bg-gray-200 px-1 rounded">frameCount</code> ensures continuous animation.</li>
    </ul>
</div>
//: JS
background(0)
stroke(255, 255, 0)
noFill()

lookPos = lookPos.lerp(V(mouseX - width / 2, mouseY - height / 2), 0.3)
rotate(lookPos.heading())
ratio = map(lookPos.mag(), 0, width / 2, 1, .2)

drawingContext.shadowColor = 'white'
const blurs = [80, 40, 20, 10, 10, 10]

function drawTheCircle(size, zOffset) {
    push()
    translate(zOffset * (1 - ratio), 0)
    for (const blur of blurs) {
        drawingContext.shadowBlur = blur
        ellipse(0, 0, size * ratio, size)
        arc(0, 0, size * ratio, size, lookPos.heading() + 180, lookPos.heading() + 180 + size / 20)
        arc(0, 0, size * ratio, size, lookPos.heading() + 180, lookPos.heading() + 180 + size / 20)
    }
    drawingContext.shadowBlur = 0
    drawingContext.filter = 'blur(10px)'
    fill(255, 255, 0, 20)
    noStroke()
    ellipse(0, 0, size * ratio, size)
    pop()
}

drawTheCircle(100,sin(frameCount * 3.1 + 45) * 45 + 0)
drawTheCircle(150,sin(frameCount * 1.8 + 123) * 75 + 20)
drawTheCircle(50 ,sin(frameCount * 2.7 + 89) * 60 + 40)
drawTheCircle(80 ,sin(frameCount * 4.2 + 2) * 90 + 60)
drawTheCircle(30 ,sin(frameCount * 3.5 + 180) * 35 + 80)
drawTheCircle(120,sin(frameCount * 1.9 + 30) * 50 + 100)
drawTheCircle(70 ,sin(frameCount * 2.6 + 19) * 80 + 120)