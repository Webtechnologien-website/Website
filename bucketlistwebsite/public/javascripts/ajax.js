$(document).ready(function() {
  $('.create-post-form').on('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const form = $(this);
    const actionUrl = form.attr('action');
    const formData = form.serialize();

    $.ajax({
      type: 'POST',
      url: actionUrl,
      data: formData,
      success: function(response) {
        // Assuming the server returns the new post in the response
        const newPost = response.newPost;

        // Create the new post HTML using Pug-like syntax
        const newPostHtml = `
          <li class="post-details">
            <p>${newPost.title}</p>
            <p>${newPost.body}</p>
            <p>Author: ${newPost.user.username} (${newPost.user.first_name} ${newPost.user.family_name})</p>
            <p>Date: ${newPost.createdAtFormatted}</p>
            ${newPost.reactedPost ? `<p>Reacted to: ${newPost.reactedPost.user.username} (${newPost.reactedPost.user.first_name} ${newPost.reactedPost.user.family_name}) for: ${newPost.reactedPost.createdAtFormatted}</p>` : ''}
          </li>
        `;

        // Append the new post to the list of posts
        $('ul.post-list').append(newPostHtml);

        // Optionally, clear the form fields
        form[0].reset();
      },
      error: function(error) {
        // Handle any errors
        alert('Error adding post: ' + error.responseText);
      }
    });
  });

  $('.create-bucketlist-form').on('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const form = $(this);
    const actionUrl = form.attr('action');
    const formData = form.serialize();

    $.ajax({
      type: 'POST',
      url: actionUrl,
      data: formData,
      success: function(response) {
        // Assuming the server returns the new bucket list in the response
        const newBucketlist = response.newBucketlist;

        // Create the new bucket list HTML using Pug-like syntax
        const newBucketlistHtml = `
          <li>
            <h2>${newBucketlist.name}</h2>
            <p>${newBucketlist.description}</p>
            <a class="btn btn-primary" href="/home/${newBucketlist.user}/bucketlist/${newBucketlist._id}">View</a>
          </li>
        `;

        // Append the new bucket list to the list of bucket lists
        $('ul.bucketlist-list').append(newBucketlistHtml);

        // Optionally, clear the form fields
        form[0].reset();
      },
      error: function(error) {
        // Handle any errors
        alert('Error adding bucket list: ' + error.responseText);
      }
    });
  });

  $('.add-item-form').on('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const form = $(this);
    const actionUrl = form.attr('action');
    const formData = form.serialize();

    $.ajax({
      type: 'POST',
      url: actionUrl,
      data: formData,
      success: function(response) {
        // Assuming the server returns the updated item in the response
        const itemId = form.find('input[name="itemId"]').val();

        // Update the button to show "Added"
        form.replaceWith(`<button class="btn btn-success" type="button">Added</button>`);
      },
      error: function(error) {
        // Handle any errors
        alert('Error adding item: ' + error.responseText);
      }
    });
  });
});